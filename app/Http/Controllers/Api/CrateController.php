<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Crate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrateController extends Controller
{
    /**
     * List all crates with optional search and pagination.
     */
    public function index(Request $request)
    {
        $query = Crate::with(['skins', 'keys', 'items', 'weapons']);

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $crates = $query->paginate(10);

        return response()->json([
            'crates' => $crates
        ]);
    }

    /**
     * Show a single crate with its relationships.
     */
    public function show($id)
    {
        $crate = Crate::with(['skins', 'keys', 'items'])->findOrFail($id);

        return response()->json([
            'crate' => $crate
        ]);
    }

    /**
     * Create a new crate.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => ['required', 'numeric', 'regex:/^\d+(\.\d{1,2})?$/'],
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:255',
            'first_sale_date' => 'nullable|date',
            'market_hash_name' => 'nullable|string|max:255',
            'rental' => 'boolean',
            'model_player' => 'nullable|string|max:255',
            'loot_name' => 'nullable|string|max:255',
            'loot_footer' => 'nullable|string',
            'loot_image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Generate a unique string ID
        do {
            $id = 'crate-' . rand(1000, 9999);
        } while (Crate::where('id', $id)->exists());

        $validated['id'] = $id;

        $crate = Crate::create($validated);

        return response()->json([
            'message' => 'Crate created successfully.',
            'crate' => $crate->load(['skins', 'keys', 'items'])
        ], 201);
    }

    /**
     * Update an existing crate.
     */
    public function update(Request $request, $id)
    {
        $crate = Crate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => ['sometimes', 'required', 'numeric', 'regex:/^\d+(\.\d{1,2})?$/'],
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:255',
            'first_sale_date' => 'nullable|date',
            'market_hash_name' => 'nullable|string|max:255',
            'rental' => 'boolean',
            'model_player' => 'nullable|string|max:255',
            'loot_name' => 'nullable|string|max:255',
            'loot_footer' => 'nullable|string',
            'loot_image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $crate->update($validated);

        return response()->json([
            'message' => 'Crate updated successfully.',
            'crate' => $crate->fresh()->load(['skins', 'keys', 'items'])
        ]);
    }

    /**
     * Delete a crate.
     */
    public function destroy($id)
    {
        $crate = Crate::with('weapons')->findOrFail($id);

        $crate->weapons()->detach();

        $crate->delete();

        return response()->json([
            'message' => 'Crate deleted successfully and all weapons unassigned.'
        ]);
    }

}

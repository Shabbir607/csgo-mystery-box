<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Crate;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class CrateController extends Controller
{
    // List all crates with optional search and pagination
    public function index(Request $request)
    {
        $query = Crate::with(['skins', 'items']);

        if ($search = $request->query('search')) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $perPage = $request->query('per_page', 10); 
        $crates = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => true,
            'message' => 'Crates fetched successfully',
            'data' => $crates
        ]);
    }


    // Show a single crate
    public function show($id)
    {
        $crate = Crate::findOrFail($id);
        return response()->json($crate);
    }

    // Create a new crate
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|float|min:0',
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
        ], [
            'name.required' => 'The crate name is required.',
            'name.string' => 'The crate name must be a string.',
            'name.max' => 'The crate name may not be greater than 255 characters.',
            'first_sale_date.date' => 'The first sale date must be a valid date.',
            'rental.boolean' => 'The rental field must be true or false.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Generate unique crate ID
        do {
            $id = 'crate-' . rand(1000, 9999);
        } while (Crate::where('id', $id)->exists());

        $validated['id'] = $id;

        $crate = Crate::create($validated);

        return response()->json([
            'message' => 'Crate created successfully.',
            'crate' => $crate
        ], 201);
    }

    // Update an existing crate
    public function update(Request $request, $id)
    {
        $crate = Crate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|float|min:0',
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
        ], [
            'name.required' => 'The crate name is required when provided.',
            'name.string' => 'The crate name must be a string.',
            'name.max' => 'The crate name may not be greater than 255 characters.',
            'first_sale_date.date' => 'The first sale date must be a valid date.',
            'rental.boolean' => 'The rental field must be true or false.',
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
            'crate' => $crate
        ]);
    }

    // Delete a crate
    public function destroy($id)
    {
        $crate = Crate::findOrFail($id);
        $crate->delete();

        return response()->json(['message' => 'Crate deleted successfully']);
    }
    public function assignItems(Request $request, Crate $crate)
{
    $validated = $request->validate([
        'skin_ids' => 'nullable|array',
        'skin_ids.*' => 'exists:skins,id',
        'weapon_ids' => 'nullable|array',
        'weapon_ids.*' => 'exists:base_weapons,id',
    ]);

    if (!empty($validated['skin_ids'])) {
        $crate->skins()->syncWithoutDetaching($validated['skin_ids']);
    }

    if (!empty($validated['weapon_ids'])) {
        $crate->items()->syncWithoutDetaching($validated['weapon_ids']);
    }

    return response()->json([
        'status' => true,
        'message' => 'Items assigned to crate successfully',
        'crate' => $crate->load(['skins', 'items'])
    ]);
}

public function unassignItems(Request $request, Crate $crate)
{
    $validated = $request->validate([
        'skin_ids' => 'nullable|array',
        'skin_ids.*' => 'exists:skins,id',
        'weapon_ids' => 'nullable|array',
        'weapon_ids.*' => 'exists:base_weapons,id',
    ]);

    if (!empty($validated['skin_ids'])) {
        $crate->skins()->detach($validated['skin_ids']);
    }

    if (!empty($validated['weapon_ids'])) {
        $crate->items()->detach($validated['weapon_ids']);
    }

    return response()->json([
        'status' => true,
        'message' => 'Items unassigned from crate successfully',
        'crate' => $crate->load(['skins', 'items'])
    ]);
}
}
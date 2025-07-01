<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Crate;
use App\Models\Skin;
use App\Models\Rarity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;


class CollectionController extends Controller
{
    /**
     * List all collections.
     */
    public function index()
    {
        $collections = Collection::with(['crates', 'skins.rarity'])->paginate(10);
        return response()->json(['collections' => $collections]);
    }

    /**
     * Show a single collection.
     */
    public function show($id)
    {
        $collection = Collection::with(['crates', 'skins.rarity'])->findOrFail($id);
        return response()->json(['collection' => $collection]);
    }

    /**
     * Store a new collection.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // ✅ Generate unique ID
        do {
            $id = 'col-' . Str::random(8);
        } while (Collection::where('id', $id)->exists());

        $validated['id'] = $id;

        $collection = Collection::create($validated);

        return response()->json([
            'message' => 'Collection created successfully.',
            'collection' => $collection
        ], 201);
    }

    /**
     * Update an existing collection.
     */
    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|required|string|max:255',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $collection->update($validator->validated());
        return response()->json([
            'message' => 'Collection updated successfully.',
            'collection' => $collection
        ]);
    }

    /**
     * Delete a collection.
     */
    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);
        $collection->delete();

        return response()->json([
            'message' => 'Collection deleted successfully.'
        ]);
    }

    /**
     * Attach skins or crates to a collection.
     */
    public function attach(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);

        $request->validate([
            'crates' => 'array',
            'crates.*' => 'exists:crates,id',
            'skins' => 'array',
            'skins.*.id' => 'exists:skins,id',
            'skins.*.rarity_id' => 'exists:rarities,id',
        ]);

        if ($request->has('crates')) {
            $collection->crates()->syncWithoutDetaching($request->crates);
        }

        if ($request->has('skins')) {
            foreach ($request->skins as $skin) {
                $collection->skins()->syncWithoutDetaching([
                    $skin['id'] => ['rarity_id' => $skin['rarity_id']]
                ]);
            }
        }

        return response()->json([
            'message' => 'Collection relations updated successfully.'
        ]);
    }
}

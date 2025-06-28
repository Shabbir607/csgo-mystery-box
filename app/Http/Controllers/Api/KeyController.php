<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Key;
use App\Models\Crate;
use Illuminate\Http\Request;

class KeyController extends Controller
{
    public function index()
    {
        return response()->json(Key::with('crates')->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:keys,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'market_hash_name' => 'nullable|string',
            'marketable' => 'boolean',
            'image' => 'nullable|string',
            'crate_ids' => 'nullable|array',
            'crate_ids.*' => 'exists:crates,id',
        ]);

        $key = Key::create($validated);
        if (!empty($validated['crate_ids'])) {
            $key->crates()->sync($validated['crate_ids']);
        }

        return response()->json(['message' => 'Key created successfully', 'key' => $key->load('crates')]);
    }

    public function show($id)
    {
        $key = Key::with('crates')->findOrFail($id);
        return response()->json($key);
    }

    public function update(Request $request, $id)
    {
        $key = Key::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'market_hash_name' => 'nullable|string',
            'marketable' => 'boolean',
            'image' => 'nullable|string',
            'crate_ids' => 'nullable|array',
            'crate_ids.*' => 'exists:crates,id',
        ]);

        $key->update($validated);

        if (isset($validated['crate_ids'])) {
            $key->crates()->sync($validated['crate_ids']);
        }

        return response()->json(['message' => 'Key updated', 'key' => $key->load('crates')]);
    }

    public function destroy($id)
    {
        $key = Key::findOrFail($id);
        $key->delete();

        return response()->json(['message' => 'Key deleted']);
    }
}

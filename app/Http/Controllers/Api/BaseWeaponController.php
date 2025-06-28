<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaseWeapon;
use Illuminate\Http\Request;

class BaseWeaponController extends Controller
{
    public function index()
    {
        return response()->json(BaseWeapon::paginate(10));
    }

    public function show($id)
    {
        $weapon = BaseWeapon::findOrFail($id);
        return response()->json($weapon);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:base_weapons,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $weapon = BaseWeapon::create($validated);

        return response()->json([
            'message' => 'Base weapon created successfully.',
            'weapon' => $weapon
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $weapon = BaseWeapon::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $weapon->update($validated);

        return response()->json([
            'message' => 'Base weapon updated successfully.',
            'weapon' => $weapon
        ]);
    }

    public function destroy($id)
    {
        $weapon = BaseWeapon::findOrFail($id);
        $weapon->delete();

        return response()->json(['message' => 'Base weapon deleted.']);
    }
}


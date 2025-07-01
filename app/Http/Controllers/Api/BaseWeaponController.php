<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaseWeapon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;


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
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'image' => 'nullable|string|url',
            ]);

            // Extract last 2 words from name
            $words = preg_split('/\s+/', trim($validated['name']));
            $lastTwo = array_slice($words, -2);
            $idSuffix = Str::slug(implode(' ', $lastTwo), '_');
            $generatedId = 'base_weapon-' . $idSuffix;

            // Check for duplicate ID
            if (BaseWeapon::find($generatedId)) {
                return response()->json([
                    'message' => 'A base weapon with this ID already exists.',
                    'id' => $generatedId
                ], 409);
            }

            // Save with generated ID
            $weapon = BaseWeapon::create([
                'id' => $generatedId,
                ...$validated,
            ]);

            return response()->json([
                'message' => 'Base weapon created successfully.',
                'weapon' => $weapon
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Throwable $e) {

            return response()->json([
                'message' => 'Server error occurred while creating base weapon.'
            ], 500);
        }
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


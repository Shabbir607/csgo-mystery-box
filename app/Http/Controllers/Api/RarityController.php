<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rarity;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RarityController extends Controller
{
    public function index()
    {
        return response()->json(Rarity::all());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:rarities,name',
                'color' => 'required|string|max:7',
                'probability' => 'required|numeric|min:0|max:1',
            ]);

            $rarity = Rarity::create($validated);

            return response()->json([
                'message' => 'Rarity created successfully.',
                'rarity' => $rarity
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Server error occurred while creating rarity.'
            ], 500);
        }
    }

    public function show($id)
    {
        $rarity = Rarity::findOrFail($id);
        return response()->json($rarity);
    }

    public function update(Request $request, $id)
    {
        $rarity = Rarity::findOrFail($id);

        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:rarities,name,' . $id,
                'color' => 'sometimes|required|string|max:7',
                'probability' => 'sometimes|required|numeric|min:0|max:1',
            ]);

            $rarity->update($validated);

            return response()->json([
                'message' => 'Rarity updated successfully.',
                'rarity' => $rarity
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Server error occurred while updating rarity.'
            ], 500);
        }
    }

    public function destroy($id)
    {
        $rarity = Rarity::findOrFail($id);
        $rarity->delete();

        return response()->json(['message' => 'Rarity deleted.']);
    }
}



<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Crate;
use App\Models\BaseWeapon;
use Illuminate\Http\Request;

class CrateWeaponController extends Controller
{
    /**
     * Assign multiple weapons to a crate.
     */
    public function assignWeapons(Request $request, $crateId)
    {
        $request->validate([
            'weapon_ids' => 'required|array|min:1',
            'weapon_ids.*' => 'exists:base_weapons,id'
        ]);

        $crate = Crate::findOrFail($crateId);

        // Sync without detaching old (to avoid duplicate error)
        $crate->baseWeapons()->syncWithoutDetaching($request->weapon_ids);

        return response()->json([
            'message' => 'Weapons assigned successfully.',
            'weapons' => $crate->baseWeapons
        ]);
    }

    /**
     * Unassign multiple weapons from a crate.
     */
    public function unassignWeapons(Request $request, $crateId)
    {
        $request->validate([
            'weapon_ids' => 'required|array|min:1',
            'weapon_ids.*' => 'exists:base_weapons,id'
        ]);

        $crate = Crate::findOrFail($crateId);
        $crate->baseWeapons()->detach($request->weapon_ids);

        return response()->json([
            'message' => 'Weapons unassigned successfully.',
            'weapons' => $crate->baseWeapons
        ]);
    }

    /**
     * List weapons assigned to a crate.
     */
    public function listWeapons($crateId)
    {
        $crate = Crate::with('baseWeapons')->findOrFail($crateId);

        return response()->json([
            'crate_id' => $crate->id,
            'weapons' => $crate->baseWeapons
        ]);
    }
}


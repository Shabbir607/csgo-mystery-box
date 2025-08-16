<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class UserInventoryController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $inventory = UserInventory::with("baseWeapon")
                                    ->where("user_id", $user->id)
                                    ->get();

            return response()->json(["inventory" => $inventory], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to retrieve user inventory.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }

    public function sellItem(Request $request, $inventoryId)
    {
        try {
            $user = Auth::user();
            $item = UserInventory::where("id", $inventoryId)
                               ->where("user_id", $user->id)
                               ->firstOrFail();

            // Assuming base_weapon has a price attribute for selling
            $sellPrice = $item->baseWeapon->price ?? 0; 

            $user->details->increment("balance", $sellPrice);
            $item->delete();

            return response()->json([
                "message" => "Item sold successfully.",
                "new_balance" => $user->details->balance,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to sell item.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }
}



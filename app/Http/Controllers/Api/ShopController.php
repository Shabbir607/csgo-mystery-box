<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaseWeapon;
use App\Models\UserInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class ShopController extends Controller
{
    public function getShopItems(Request $request)
    {
        try {
            $query = BaseWeapon::query();

            if ($search = $request->query("search")) {
                $query->where("name", "like", "%{$search}%");
            }

            $items = $query->paginate(10);

            return response()->json(["items" => $items], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to retrieve shop items.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }

    public function purchaseItem(Request $request, $itemId)
    {
        $request->validate([
            "quantity" => "sometimes|integer|min:1|max:1", // Only 1 for now
        ]);

        $quantity = $request->quantity ?? 1;
        $user = Auth::user();
        $item = BaseWeapon::findOrFail($itemId);

        $totalPrice = $item->price * $quantity;

        if (!$user->details || $user->details->balance < $totalPrice) {
            return response()->json(["message" => "Insufficient balance or user details not found."], 400);
        }

        DB::beginTransaction();
        try {
            $user->details->decrement("balance", $totalPrice);

            for ($i = 0; $i < $quantity; $i++) {
                UserInventory::create([
                    "user_id" => $user->id,
                    "base_weapon_id" => $item->id,
                    "acquired_at" => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                "message" => "Item(s) purchased successfully.",
                "new_balance" => $user->details->balance,
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                "message" => "Failed to purchase item.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }
}



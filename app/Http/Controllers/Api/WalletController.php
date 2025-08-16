<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Exception;

class WalletController extends Controller
{
    public function getBalance()
    {
        try {
            $user = Auth::user();
            if (!$user || !$user->details) {
                return response()->json(["message" => "User or user details not found."], 404);
            }

            return response()->json([
                "balance" => $user->details->balance,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to retrieve wallet balance.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }

    public function deposit(Request $request)
    {
        try {
            $request->validate([
                "amount" => "required|numeric|min:0.01",
            ]);

            $user = Auth::user();
            if (!$user || !$user->details) {
                return response()->json(["message" => "User or user details not found."], 404);
            }

            $user->details->increment("balance", $request->amount);

            return response()->json([
                "message" => "Deposit successful.",
                "new_balance" => $user->details->balance,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                "message" => "Validation failed.",
                "errors"  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to process deposit.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }

    public function withdraw(Request $request)
    {
        try {
            $request->validate([
                "amount" => "required|numeric|min:0.01",
            ]);

            $user = Auth::user();
            if (!$user || !$user->details) {
                return response()->json(["message" => "User or user details not found."], 404);
            }

            if ($user->details->balance < $request->amount) {
                return response()->json(["message" => "Insufficient balance."], 400);
            }

            $user->details->decrement("balance", $request->amount);

            return response()->json([
                "message" => "Withdrawal successful.",
                "new_balance" => $user->details->balance,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                "message" => "Validation failed.",
                "errors"  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to process withdrawal.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }
}



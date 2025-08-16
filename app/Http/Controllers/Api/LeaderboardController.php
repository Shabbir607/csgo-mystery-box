<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;

class LeaderboardController extends Controller
{
    public function topUsersByBalance()
    {
        try {
            $users = User::with("details")
                         ->join("user_details", "users.id", "=", "user_details.user_id")
                         ->orderBy("user_details.balance", "desc")
                         ->limit(10)
                         ->get(["users.id", "users.name", "user_details.balance"]);

            return response()->json(["leaderboard" => $users], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to retrieve leaderboard.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }

    public function topUsersByCasesOpened()
    {
        try {
            $users = User::with("details")
                         ->join("user_details", "users.id", "=", "user_details.user_id")
                         ->orderBy("user_details.cases_opened", "desc")
                         ->limit(10)
                         ->get(["users.id", "users.name", "user_details.cases_opened"]);

            return response()->json(["leaderboard" => $users], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to retrieve leaderboard.",
                "error"   => $e->getMessage(),
            ], 500);
        }
    }
}



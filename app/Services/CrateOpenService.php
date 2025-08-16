<?php 
namespace App\Services;

use App\Models\{Crate, CrateOpen, BaseWeapon, UserInventory};
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Exception;

class CrateOpenService
{
    public function openCrate($user, $crateId, $clientSeed)
    {
        $crate = Crate::with("weapons")->findOrFail($crateId);

        if (!$user->details || $user->details->balance < $crate->price) {
            throw new Exception("Insufficient balance or user details not found.");
        }

        DB::beginTransaction();
        try {
            // Deduct crate price from user balance
            $user->details->decrement("balance", $crate->price);

            // Generate server seed and nonce
            $serverSeed = Str::random(32);
            $nonce = CrateOpen::where("user_id", $user->id)->count() + 1;
            $serverSeedHash = hash("sha256", $serverSeed);

            // Calculate the roll number using the provably fair formula
            $combinedSeed = hash("sha256", $serverSeed . $clientSeed . $nonce);
            $roll = hexdec(substr($combinedSeed, 0, 8)) / 0x100000000; // Roll between 0 and 1

            $weapon = $this->determineWeapon($crate->weapons, $roll);

            $crateOpen = CrateOpen::create([
                "user_id" => $user->id,
                "crate_id" => $crate->id,
                "weapon_id" => optional($weapon)->id,
                "client_seed" => $clientSeed,
                "server_seed" => $serverSeed,
                "server_seed_hash" => $serverSeedHash,
                "nonce" => $nonce,
                "probability_used" => $roll,
                "price_paid" => $crate->price,
            ]);

            // Add the winning item to user's inventory
            if ($weapon) {
                UserInventory::create([
                    "user_id" => $user->id,
                    "base_weapon_id" => $weapon->id,
                    "crate_open_id" => $crateOpen->id,
                    "acquired_at" => now(),
                ]);
            }

            DB::commit();

            return $crateOpen->load(["weapon", "crate"]);

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // This method is no longer needed for the provably fair roll calculation
    // private function getRandomNumber(): float
    // {
    //     $response = Http::get("https://www.random.org/decimal-fractions/", [
    //         "num" => 1,
    //         "dec" => 8,
    //         "col" => 1,
    //         "format" => "plain",
    //         "rnd" => "new"
    //     ]);

    //     return floatval(trim($response->body()));
    // }

    private function determineWeapon($weapons, $roll)
    {
        $cumulativeProbability = 0.0;
        foreach ($weapons as $weapon) {
            $cumulativeProbability += $weapon->probability;
            if ($roll <= $cumulativeProbability) {
                return $weapon;
            }
        }
        return null;
    }
}



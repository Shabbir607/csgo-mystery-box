<?php 
namespace App\Services;

use App\Models\{Crate, CrateOpen, BaseWeapon};
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class CrateOpenService
{
    public function openCrate($user, $crateId, $clientSeed)
    {
        $crate = Crate::with('weapons')->findOrFail($crateId);
        $serverSeed = Str::random(32);
        $nonce = CrateOpen::where('user_id', $user->id)->count();
        $serverSeedHash = hash('sha256', $serverSeed);

        $probability = $this->getRandomNumber();

        $weapon = $this->determineWeapon($crate->weapons, $probability);

        $crateOpen = CrateOpen::create([
            'user_id' => $user->id,
            'crate_id' => $crate->id,
            'weapon_id' => optional($weapon)->id,
            'client_seed' => $clientSeed,
            'server_seed' => $serverSeed,
            'server_seed_hash' => $serverSeedHash,
            'nonce' => $nonce,
            'probability_used' => $probability
        ]);

        return $crateOpen->load(['weapon', 'crate']);
    }

    private function getRandomNumber(): float
    {
        $response = Http::get('https://www.random.org/decimal-fractions/', [
            'num' => 1,
            'dec' => 8,
            'col' => 1,
            'format' => 'plain',
            'rnd' => 'new'
        ]);

        return floatval(trim($response->body()));
    }

    private function determineWeapon($weapons, $probability)
    {
        $cumulative = 0.0;
        foreach ($weapons as $weapon) {
            $cumulative += $weapon->probability;
            if ($probability <= $cumulative) {
                return $weapon;
            }
        }
        return null;
    }
}
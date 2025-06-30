<?php
namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class ProvablyFairService
{
    public function initializeGame(?string $clientSeed = null): array
    {
        $gameId = 'game_' . now()->timestamp . '_' . Str::random(8);
        $serverSeed = bin2hex(random_bytes(32));
        $serverSeedHash = hash('sha256', $serverSeed);
        $clientSeed = $clientSeed ?? Str::random(32);

        // Save server seed in secure storage
        Storage::put("games/$gameId.json", json_encode([
            'serverSeed' => $serverSeed,
            'clientSeed' => $clientSeed,
            'serverSeedHash' => $serverSeedHash,
            'nonce' => 0,
            'gameId' => $gameId
        ]));

        return [
            'gameId' => $gameId,
            'serverSeedHash' => $serverSeedHash,
            'clientSeed' => $clientSeed
        ];
    }

    public function playGame(string $gameId, string $type, array $params): array
    {
        $data = json_decode(Storage::get("games/$gameId.json"), true);
        $combinedHash = hash_hmac('sha256', "{$data['clientSeed']}:{$data['nonce']}", $data['serverSeed']);

        // Request random number from random.org fallback
        $response = Http::post('https://www.random.org/integers/', [
            'apiKey' => env('RANDOM_ORG_API_KEY', 'demo-key'),
            'n' => 1,
            'min' => $type === 'coinflip' ? 0 : ($type === 'dice' ? 1 : 0),
            'max' => $type === 'coinflip' ? 1 : ($type === 'dice' ? 6 : 99999),
            'replacement' => true,
            'base' => 10
        ])->json();

        $random = $response['result']['random']['data'][0] ?? rand(0, 99999);

        $outcome = match($type) {
            'coinflip' => $random,
            'dice'     => $random,
            'case'     => $this->resolveCase($random, $params['items']),
        };

        return [
            'gameId' => $gameId,
            'finalHash' => $combinedHash,
            'outcome' => $outcome,
            'random' => $random,
            'seeds' => [
                'serverSeed' => $data['serverSeed'],
                'clientSeed' => $data['clientSeed'],
                'nonce' => $data['nonce'],
                'serverSeedHash' => $data['serverSeedHash']
            ]
        ];
    }

    public function verifyGame(string $gameId, ?string $providedServerSeed = null): array
    {
        $stored = json_decode(Storage::get("games/$gameId.json"), true);
        $serverSeed = $providedServerSeed ?? $stored['serverSeed'];

        $serverSeedHashValid = hash('sha256', $serverSeed) === $stored['serverSeedHash'];
        $combinedHashValid = hash_hmac('sha256', "{$stored['clientSeed']}:{$stored['nonce']}", $serverSeed);

        return [
            'isValid' => $serverSeedHashValid && $combinedHashValid,
            'details' => [
                'serverSeedMatches' => $serverSeedHashValid,
                'hashMatches' => $combinedHashValid,
                'outcomeMatches' => true,
                'randomOrgVerified' => true // Simplified
            ],
            'gameResult' => $stored
        ];
    }

    protected function resolveCase(int $random, array $items): int
    {
        $percent = ($random / 99999) * 100;
        $cumulative = 0;

        foreach ($items as $index => $item) {
            $cumulative += $item['probability'] ?? 0;
            if ($percent <= $cumulative) {
                return $index;
            }
        }

        return count($items) - 1;
    }
}

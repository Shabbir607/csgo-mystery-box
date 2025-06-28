<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\SteamAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Str;

class SteamLoginController extends Controller
{


    private $apiDelay = 500; 
    private $maxAttempts = 3;
 public function redirect()
{
    $openid = new \App\Libraries\OpenID\LightOpenID(config('app.url'));

    $openid->identity = 'http://steamcommunity.com/openid';
    $openid->returnUrl = route('steam.callback'); // returns ngrok callback
    $openid->realm = config('app.url');            // must match returnUrl domain

    return redirect($openid->authUrl());
}



    public function handleSteamCallback(Request $request)
    {
        $openid = new \App\Libraries\OpenID\LightOpenID(config('app.url'));

        if ($openid->mode === 'cancel') {
            return response()->json(['message' => 'User cancelled Steam login.'], 400);
        }

        if (!$openid->mode || !$openid->validate()) {
            Log::warning('Steam OpenID validation failed', $request->all());
            return response()->json(['message' => 'Steam login validation failed'], 401);
        }

        $steamId = basename($openid->identity);
        
        try {
            $userData = $this->fetchSteamUserData($steamId);
            $user = $this->createOrUpdateUser($steamId, $userData);
            
            Auth::login($user);
            $token = $user->createToken('steam_login')->plainTextToken;
            
            return redirect()->to(config('app.frontend_url').'/login-success?token='.$token);
            
        } catch (\Exception $e) {
            Log::error('Steam login error: '.$e->getMessage());
            return response()->json(['message' => 'Error processing Steam login'], 500);
        }
    }

    private function fetchSteamUserData(string $steamId): array
    {
        $apiKey = env('STEAM_API_KEY');
        $client = new Client([
            'timeout' => 15,
            'http_errors' => true,
        ]);

        // Implement sequential requests with delays to avoid rate limiting
        $data = [
            'player_summary' => $this->getWithRetry($client, $apiKey, 
                "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={$apiKey}&steamids={$steamId}"
            ),
            'bans' => $this->getWithRetry($client, $apiKey,
                "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key={$apiKey}&steamids={$steamId}"
            ),
            'owned_games' => $this->getWithRetry($client, $apiKey,
                "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={$apiKey}&steamid={$steamId}&include_appinfo=true"
            ),
            'friends' => $this->getWithRetry($client, $apiKey,
                "https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key={$apiKey}&steamid={$steamId}&relationship=friend"
            ),
            'recent_games' => $this->getWithRetry($client, $apiKey,
                "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key={$apiKey}&steamid={$steamId}"
            ),
            'inventory' => $this->getWithRetry($client, $apiKey,
                "https://steamcommunity.com/inventory/{$steamId}/730/2?l=english",
                false // Don't throw errors for inventory
            ),
        ];

        return [
            'player_summary' => json_decode($data['player_summary'], true)['response']['players'][0] ?? null,
            'bans' => json_decode($data['bans'], true),
            'owned_games' => json_decode($data['owned_games'], true),
            'friends' => json_decode($data['friends'], true),
            'recent_games' => json_decode($data['recent_games'], true),
            'inventory' => $data['inventory'] ? json_decode($data['inventory'], true) : null,
        ];
    }

    private function getWithRetry(Client $client, string $apiKey, string $url, bool $throwErrors = true)
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxAttempts) {
            try {
                usleep($this->apiDelay * 1000); // Respect rate limits
                
                $response = $client->get($url, [
                    'headers' => [
                        'User-Agent' => 'YourApp/1.0',
                        'Accept' => 'application/json'
                    ]
                ]);
                
                return $response->getBody()->getContents();
                
            } catch (RequestException $e) {
                $lastException = $e;
                
                if ($e->getCode() === 429) {
                    
                    $delay = min(pow(2, $attempt)) * 1000;
                    usleep($delay);
                    $attempt++;
                    continue;
                }
                
                if ($throwErrors) {
                    throw $e;
                }
                
                return null;
            }
        }

        throw $lastException ?? new \Exception("API request failed after {$this->maxAttempts} attempts");
    }

    private function createOrUpdateUser(string $steamId, array $data): User
    {
        $playerSummary = $data['player_summary'];
        $banInfo = $data['bans']['players'][0] ?? [];
        
        // Main user record
        $user = User::updateOrCreate(
            ['steamid' => $steamId],
            [
                'name' => $playerSummary['personaname'] ?? 'Steam User',
                'email' => "{$steamId}@steam.fake",
                'password' => bcrypt(str()->random(32)),
                'email_verified_at' => now(),
                'avatar' => $playerSummary['avatarfull'] ?? null,
                'profile_url' => $playerSummary['profileurl'] ?? null,
            ]
        );
        
        // Steam account
        $user->steamAccount()->updateOrCreate(
            ['steam_id' => $steamId],
            [
                'steam_username' => $playerSummary['personaname'] ?? null,
                'profile_url' => $playerSummary['profileurl'] ?? null,
                'avatar_url' => $playerSummary['avatarfull'] ?? null,
                'last_sync' => now(),
                'is_linked' => true,
            ]
        );
        
        // User details with all fields
        $level = $this->calculateUserLevel([
            'account_age' => $playerSummary['timecreated'] ?? 0,
            'games_owned' => $data['owned_games']['response']['game_count'] ?? 0,
            'friends_count' => count($data['friends']['friendslist']['friends'] ?? []),
            'recent_activity' => $data['recent_games']['response']['total_count'] ?? 0,
            'inventory_value' => $this->estimateInventoryValue($data['inventory'])
        ]);
        
        $userDetailsData = [
            'steam_id' => $steamId,
            'level' => $level,
            'balance' => 0.0,
            'total_opened' => 0,
            'community_visibility_state' => $playerSummary['communityvisibilitystate'] ?? null,
            'profile_state' => $playerSummary['profilestate'] ?? null,
            'persona_name' => $playerSummary['personaname'] ?? null,
            'comment_permission' => $playerSummary['commentpermission'] ?? null,
            'avatar' => $playerSummary['avatar'] ?? null,
            'avatar_medium' => $playerSummary['avatarmedium'] ?? null,
            'avatar_full' => $playerSummary['avatarfull'] ?? null,
            'avatar_hash' => $playerSummary['avatarhash'] ?? null,
            'persona_state' => $playerSummary['personastate'] ?? null,
            'real_name' => $playerSummary['realname'] ?? null,
            'primary_clan_id' => $playerSummary['primaryclanid'] ?? null,
            'time_created' => $playerSummary['timecreated'] ?? null,
            'persona_state_flags' => $playerSummary['personastateflags'] ?? null,
            'country_code' => $playerSummary['loccountrycode'] ?? null,
            'state_code' => $playerSummary['locstatecode'] ?? null,
            'city_id' => $playerSummary['loccityid'] ?? null,
            'community_banned' => $banInfo['CommunityBanned'] ?? false,
            'vac_banned' => $banInfo['VACBanned'] ?? false,
            'vac_bans' => $banInfo['NumberOfVACBans'] ?? 0,
            'days_since_last_ban' => $banInfo['DaysSinceLastBan'] ?? 0,
            'game_bans' => $banInfo['NumberOfGameBans'] ?? 0,
            'economy_ban' => $banInfo['EconomyBan'] ?? 'none',
            'owned_games_count' => $data['owned_games']['response']['game_count'] ?? 0,
            'friends_count' => count($data['friends']['friendslist']['friends'] ?? []),
            'recent_games_count' => $data['recent_games']['response']['total_count'] ?? 0,
            'inventory_value' => $this->estimateInventoryValue($data['inventory']),
            'last_login' => now(),
            'join_date' => $playerSummary['timecreated'] ? date('Y-m-d H:i:s', $playerSummary['timecreated']) : now(),
        ];
        
        $user->details()->updateOrCreate(
            ['steam_id' => $steamId],
            $userDetailsData
        );
        
        return $user;
    }

    private function calculateUserLevel(array $metrics): int
    {
        $factors = [
            min(20, floor((time() - $metrics['account_age']) / 31536000)), // Age
            min(30, floor($metrics['games_owned'] / 10)), // Games
            min(10, floor($metrics['friends_count'] / 20)), // Friends
            min(10, floor($metrics['recent_activity'] / 5)), // Activity
            min(30, floor($metrics['inventory_value'] / 100)), // Inventory
        ];
        
        return min(100, max(1, array_sum($factors)));
    }

    private function estimateInventoryValue(?array $inventory): float
    {
        if (empty($inventory['descriptions'])) {
            return 0.0;
        }
        
        $total = 0.0;
        
        foreach ($inventory['descriptions'] as $item) {
            if (($item['marketable'] ?? 0) !== 1) continue;
            
            $value = match($item['type'] ?? '') {
                'Container' => 0.5,
                'Weapon' => isset($item['fraudwarnings']) ? 0.1 : 1.0,
                'Knife' => 50.0,
                'Gloves' => 30.0,
                'Music Kit' => 5.0,
                'Sticker' => 2.0,
                default => 0.5
            };
            
            foreach ($item['descriptions'] ?? [] as $desc) {
                if (str_contains($desc['value'] ?? '', 'Exterior')) {
                    $wear = strtolower($desc['value']);
                    $value *= match(true) {
                        str_contains($wear, 'factory new') => 1.5,
                        str_contains($wear, 'minimal wear') => 1.2,
                        str_contains($wear, 'battle-scarred') => 0.5,
                        default => 1.0
                    };
                    break;
                }
            }
            
            $total += $value;
        }
        
        return round($total, 2);
    }
}


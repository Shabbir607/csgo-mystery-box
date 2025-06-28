<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use App\Http\Controllers\Controller;

class SteamAuthController extends Controller
{
    public function redirectToSteam()
    {
        $params = [
            'openid.ns'         => 'http://specs.openid.net/auth/2.0',
            'openid.mode'       => 'checkid_setup',
            'openid.return_to'  => route('steam.callback', [], true),
            'openid.realm'      => config('app.url'),
            'openid.identity'   => 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id' => 'http://specs.openid.net/auth/2.0/identifier_select',
        ];

        $url = 'https://steamcommunity.com/openid/login?' . http_build_query($params);
        return response()->json(['url' => $url]);
    }

    public function handleSteamCallback(Request $request)
    {
        $params = $request->all();
        $params['openid.mode'] = 'check_authentication';

        $verify = Http::asForm()->post('https://steamcommunity.com/openid/login', $params);

        if (str_contains($verify->body(), "is_valid:true")) {
            preg_match("/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/", $request->get('openid_claimed_id'), $matches);
            $steamId = $matches[1] ?? null;

            if ($steamId) {
                $apiKey = env('STEAM_API_KEY');
                $response = Http::get("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/", [
                    'key' => $apiKey,
                    'steamids' => $steamId,
                ]);

                $player = $response['response']['players'][0] ?? null;

                if ($player) {
                    $user = User::updateOrCreate(
                        ['steamid' => $steamId],
                        [
                            'name' => $player['personaname'],
                            'avatar' => $player['avatarfull'],
                        ]
                    );

                    $token = $user->createToken('steam_token')->plainTextToken;

                    return response()->json([
                        'token' => $token,
                        'user' => $user,
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Steam login failed'], 401);
    }
}


<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Role;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorCodeMail;


class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Fetch default role (e.g., 'user')
        $defaultRole = Role::where('name', 'user')->first();

        if (!$defaultRole) {
            return response()->json([
                'message' => 'Default role not found. Please seed roles table.',
            ], 500);
        }

        $user = User::create([
            'name' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $defaultRole->id,
        ]);

        $userData = $user->toArray();
        unset($userData['role_id']);

        return response()->json([
            'user' => $userData,
            'isAdmin' => false,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::with(['steamAccount', 'details'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }


        if ($user->two_factor_enabled) {
            $code = rand(100000, 999999);
            Cache::put('2fa_code_' . $user->id, $code, now()->addMinutes(10));

            Mail::to($user->email)->send(new \App\Mail\TwoFactorCodeMail($code));

            return response()->json([
                'message' => '2FA code sent. Please verify.',
                'requires_2fa' => true,
                'user_id' => $user->id,
            ], 202);
        }

        Auth::login($user);

        $userData = $user->toArray();
        unset($userData['role_id']);

        return response()->json([
            'user' => $userData,
            'isAdmin' => $user->role_id == 1,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }



    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Successfully logged out'
            ]);
        }

        return response()->json([
            'message' => 'Unauthenticated or no token found.'
        ], 401);
    }


    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'user' => $user->load('role'),
        ]);
    }
    public function verify2fa(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|digits:6',
        ]);

        $user = User::find($request->user_id);
        $cachedCode = Cache::get('2fa_code_' . $user->id);

        if (!$cachedCode || $request->code != $cachedCode) {
            return response()->json(['message' => 'Invalid or expired code.'], 403);
        }

        // Code valid: remove from cache
        Cache::forget('2fa_code_' . $user->id);

        Auth::login($user);

        return response()->json([
            'message' => '2FA verified successfully.',
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user->toArray(),
            'isAdmin' => $user->role_id == 1,
        ]);
    }

}

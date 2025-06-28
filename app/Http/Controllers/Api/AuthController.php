<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

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

    $user = User::create([
        'name' => $request->username,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role_id' => \App\Models\Role::USER,
    ]);

    // Remove role_id from response
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
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('role')
        ]);
    }
}

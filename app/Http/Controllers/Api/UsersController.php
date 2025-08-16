<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Exception;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::with(['role', 'details']);

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            $users = $query->paginate(10);

            return response()->json(['users' => $users], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch users.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $user = User::with(['role', 'details'])->findOrFail($id);
            return response()->json(['user' => $user], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'User not found.',
                'error'   => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $user = User::with('details')->findOrFail($id);

            $validated = $request->validate([
                'name'       => 'sometimes|string|max:255',
                'email'      => 'sometimes|email|max:255|unique:users,email,' . $user->id,
                'password'   => ['sometimes', 'confirmed', Rules\Password::defaults()],
                'role_id'    => 'sometimes|exists:roles,id',
                'status'     => 'sometimes|in:active,inactive,banned,verified,unverified',
                'is_verified'=> 'sometimes|boolean',
                'country'    => 'sometimes|string|max:100',
                'two_factor_enabled' => 'sometimes|boolean',
                'join_date'  => 'sometimes|date',
                'last_login' => 'sometimes|date',
                'ip_address' => 'sometimes|ip',
                'avatar'     => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',

                'level'            => 'sometimes|integer|min:0',
                'balance'          => 'sometimes|numeric|min:0',
                'total_spent'      => 'sometimes|numeric|min:0',
                'total_won'        => 'sometimes|numeric|min:0',
                'inventory_value'  => 'sometimes|numeric|min:0',
                'cases_opened'     => 'sometimes|integer|min:0',
                'real_name'        => 'sometimes|string|max:255',
                'persona_name'     => 'sometimes|string|max:255',
                'steam_id'         => 'sometimes|string|max:50|unique:user_details,steam_id,' . optional($user->details)->id,
            ]);

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            if ($request->hasFile('avatar')) {
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $userData = collect($validated)->only([
                'name', 'email', 'password', 'role_id', 'status',
                'is_verified', 'country', 'two_factor_enabled',
                'join_date', 'last_login', 'ip_address', 'avatar'
            ])->toArray();

            $detailsData = collect($validated)->only([
                'level', 'balance', 'total_spent', 'total_won',
                'inventory_value', 'cases_opened', 'real_name',
                'persona_name', 'steam_id'
            ])->toArray();

            $user->update($userData);

            if (!empty($detailsData)) {
                $user->details()->updateOrCreate(['user_id' => $user->id], $detailsData);
            }

            return response()->json([
                'message' => 'User updated successfully.',
                'user'    => $user->fresh()->load(['role', 'details']),
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to update user.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);

            if ($user->id === auth()->id()) {
                return response()->json(['message' => 'You cannot delete your own account.'], 403);
            }

            $user->delete();
            return response()->json(['message' => 'User deleted successfully.'], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'User not found or could not be deleted.',
                'error'   => $e->getMessage(),
            ], 404);
        }
    }

    public function usersWithRoleTwo()
    {
        try {
            $users = User::with(['role', 'details'])->where('role_id', 2)->paginate(10);
            return response()->json(['users' => $users], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch regular users.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function addFunds(Request $request, string $id)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.01',
            ]);

            $user = User::with('details')->findOrFail($id);

            if (!$user->details) {
                return response()->json(['message' => 'User details not found.'], 404);
            }

            $user->details->increment('balance', $request->amount);

            return response()->json([
                'message'     => 'Funds added successfully.',
                'new_balance' => $user->details->balance,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to add funds.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function makeAdmin(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['role_id' => 1]);

            return response()->json([
                'message' => 'User promoted to admin successfully.',
                'user'    => $user->fresh()->load('role'),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to promote user.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function unmakeAdmin(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->update(['role_id' => 2]);

            return response()->json([
                'message' => 'User demoted from admin successfully.',
                'user'    => $user->fresh()->load('role'),
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to demote user.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}

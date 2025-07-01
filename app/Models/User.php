<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'steamid',
        'avatar',
        'profile_url',
        'role_id',
        'status',
        'is_verified',
        'join_date',
        'last_login',
        'ip_address',
        'country',
        'two_factor_enabled',
    ];

    /**
     * Attributes that should be hidden.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts for model fields.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'join_date' => 'date',
            'last_login' => 'datetime',
        ];
    }

    /**
     * Get the role relationship.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role && $this->role->name === 'admin';
    }

    /**
     * Get the user's extended profile details.
     */
    public function details(): HasOne
    {
        return $this->hasOne(UserDetails::class);
    }

    /**
     * Get the user's Steam account (if separate).
     */
    public function steamAccount(): HasOne
    {
        return $this->hasOne(SteamAccount::class);
    }

    /**
     * Get the full avatar URL (from details).
     */
    public function avatarUrl(): ?string
    {
        return $this->details?->avatar_full ?? $this->avatar;
    }

    /**
     * Accessor for full name (if needed from details).
     */
    public function fullName(): ?string
    {
        return $this->details?->real_name ?? $this->name;
    }
}

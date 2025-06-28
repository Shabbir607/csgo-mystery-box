<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SteamAccount extends Model
{
     protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'steam_id',
        'steam_username',
        'profile_url',
        'avatar_url',
        'is_linked',
        'trade_url',
        'is_trade_url_valid',
        'last_sync'
    ];

    protected $casts = [
        'is_linked' => 'boolean',
        'is_trade_url_valid' => 'boolean',
        'linked_date' => 'datetime',
        'last_sync' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

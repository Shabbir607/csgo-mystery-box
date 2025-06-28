<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetails extends Model
{
    protected $table = 'user_details';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'steam_id',
        'balance',
        'level',
        'total_opened',
        'inventory_value',
        'community_visibility_state',
        'profile_state',
        'persona_name',
        'comment_permission',
        'profile_url',
        'avatar',
        'avatar_medium',
        'avatar_full',
        'avatar_hash',
        'persona_state',
        'real_name',
        'primary_clan_id',
        'time_created',
        'persona_state_flags',
        'country_code',
        'state_code',
        'city_id',
        'community_banned',
        'vac_banned',
        'vac_bans',
        'days_since_last_ban',
        'game_bans',
        'economy_ban',
        'owned_games_count',
        'friends_count',
        'recent_games_count',
        'last_login'
    ];

    protected $casts = [
        'community_banned' => 'boolean',
        'vac_banned' => 'boolean',
        'join_date' => 'datetime',
        'last_login' => 'datetime',
        'balance' => 'decimal:2',
        'inventory_value' => 'decimal:2'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

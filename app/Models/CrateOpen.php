<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrateOpen extends Model
{
       protected $fillable = [
        'user_id', 'crate_id', 'weapon_id', 'client_seed', 'server_seed', 'server_seed_hash', 'nonce', 'probability_used'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function crate() {
        return $this->belongsTo(Crate::class);
    }

    public function weapon() {
        return $this->belongsTo(BaseWeapon::class, 'weapon_id');
    }
}

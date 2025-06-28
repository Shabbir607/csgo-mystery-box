<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaseWeapon extends Model
{
        public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'description',
        'image',
        'rarity',
        'price',
        'probability',
    ];
        public function crates()
    {
        return $this->belongsToMany(Crate::class, 'crate_weapon', 'base_weapon_id', 'crate_id');
    }
}

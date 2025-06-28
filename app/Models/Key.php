<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Key extends Model
{
       public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'description', 'market_hash_name', 'marketable', 'image',
    ];

    public function crates()
    {
        return $this->belongsToMany(Crate::class);
    }
}

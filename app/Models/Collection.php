<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Collection extends Model
{
    protected $guarded = [];
    
    public $incrementing = false;
    protected $keyType = 'string';
    
    public function crates(): BelongsToMany
    {
        return $this->belongsToMany(Crate::class);
    }
    
    public function skins(): BelongsToMany
    {
        return $this->belongsToMany(Skin::class)
            ->withPivot('rarity_id');
    }
}

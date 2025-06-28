<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('csgo_agents', function (Blueprint $table) {
            $table->id();
              $table->string('agent_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('rarity_id')->nullable();
            $table->string('rarity_name')->nullable();
            $table->string('rarity_color')->nullable();
            $table->string('collection_id')->nullable();
            $table->string('collection_name')->nullable();
            $table->string('collection_image')->nullable();
            $table->string('team_id')->nullable();
            $table->string('team_name')->nullable();
            $table->string('market_hash_name')->nullable();
            $table->string('image_url')->nullable();
            $table->string('model_player')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('csgo_agents');
    }
};

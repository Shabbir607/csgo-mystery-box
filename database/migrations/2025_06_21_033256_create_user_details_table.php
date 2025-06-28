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
 Schema::create('user_details', function (Blueprint $table) {
            // Basic identification
            $table->id();
           $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->string('steam_id', 20)->unique();
            
            // User stats
            $table->decimal('balance', 12, 2)->default(0);
            $table->integer('level')->default(1);
            $table->integer('total_opened')->default(0);
            $table->decimal('inventory_value', 12, 2)->default(0);
            
            // Profile information
            $table->integer('community_visibility_state')->nullable();
            $table->integer('profile_state')->nullable();
            $table->string('persona_name')->nullable();
            $table->integer('comment_permission')->nullable();
            $table->string('profile_url')->nullable();
            $table->string('avatar')->nullable();
            $table->string('avatar_medium')->nullable();
            $table->string('avatar_full')->nullable();
            $table->string('avatar_hash')->nullable();
            $table->integer('persona_state')->nullable();
            $table->string('real_name')->nullable();
            $table->string('primary_clan_id')->nullable();
            $table->integer('time_created')->nullable();
            $table->integer('persona_state_flags')->nullable();
            
            // Location information
            $table->string('country_code', 2)->nullable();
            $table->string('state_code', 2)->nullable();
            $table->integer('city_id')->nullable();
            
            // Ban information
            $table->boolean('community_banned')->default(false);
            $table->boolean('vac_banned')->default(false);
            $table->integer('vac_bans')->default(0);
            $table->integer('days_since_last_ban')->default(0);
            $table->integer('game_bans')->default(0);
            $table->string('economy_ban', 20)->default('none');
            
            // Game statistics
            $table->integer('owned_games_count')->default(0);
            $table->integer('friends_count')->default(0);
            $table->integer('recent_games_count')->default(0);
            
            // Timestamps
            $table->timestamp('join_date')->useCurrent();
            $table->timestamp('last_login')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('level');
            $table->index('persona_name');
            $table->index('country_code');
            $table->index('vac_banned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_details');
    }
};

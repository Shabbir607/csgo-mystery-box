<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();

            // Steam data
            $table->string('steam_id', 20)->unique();

            // Game & financial stats
            $table->decimal('balance', 12, 2)->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->decimal('total_won', 12, 2)->default(0);
            $table->decimal('inventory_value', 12, 2)->default(0);
            $table->unsignedInteger('cases_opened')->default(0);
            $table->unsignedInteger('level')->default(1);

            // Steam profile
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

            // Location info (more detailed than users.country)
            $table->string('country_code', 2)->nullable();
            $table->string('state_code', 2)->nullable();
            $table->integer('city_id')->nullable();

            // Ban info
            $table->boolean('community_banned')->default(false);
            $table->boolean('vac_banned')->default(false);
            $table->integer('vac_bans')->default(0);
            $table->integer('days_since_last_ban')->default(0);
            $table->integer('game_bans')->default(0);
            $table->string('economy_ban', 20)->default('none');

            // Game stats
            $table->integer('owned_games_count')->default(0);
            $table->integer('friends_count')->default(0);
            $table->integer('recent_games_count')->default(0);

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

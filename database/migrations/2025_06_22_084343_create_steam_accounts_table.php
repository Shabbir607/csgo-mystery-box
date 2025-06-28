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
        Schema::create('steam_accounts', function (Blueprint $table) {
        $table->uuid('id')->primary()->default(DB::raw('(UUID())')); 
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('steam_id')->unique();
        $table->string('steam_username');
        $table->string('profile_url');
        $table->string('avatar_url');
        $table->boolean('is_linked')->default(true);
        $table->timestamp('linked_date')->useCurrent();
        $table->string('trade_url')->nullable();
        $table->boolean('is_trade_url_valid')->default(false);
        $table->timestamp('last_sync')->nullable();
        $table->timestamps();
    
        // Indexes for better performance
        $table->index('steam_id');
        $table->index('user_id');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('steam_accounts');
    }
};

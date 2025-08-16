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
        Schema::create('crate_opens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('crate_id');
            $table->foreign('crate_id')->references('id')->on('crates')->onDelete('cascade');

            $table->string('weapon_id')->nullable();
            $table->string('client_seed');
            $table->string('server_seed');
            $table->string('server_seed_hash');
            $table->unsignedBigInteger('nonce');
            $table->float('probability_used');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crate_opens');
    }
};

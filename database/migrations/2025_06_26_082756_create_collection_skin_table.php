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
        Schema::create('collection_skin', function (Blueprint $table) {
            $table->string('collection_id');
            $table->unsignedBigInteger('skin_id');
            $table->primary(['collection_id', 'skin_id']);
            $table->foreign('collection_id')->references('id')->on('collections');
            $table->foreign('skin_id')->references('id')->on('skins');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_skin');
    }
};

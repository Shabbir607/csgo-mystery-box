<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skin_wear', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            
            $table->string('skin_id');   // ✅ must match skins.id type
            $table->unsignedBigInteger('wear_id');
            $table->timestamps();

            $table->primary(['skin_id', 'wear_id']);

            $table->foreign('skin_id')->references('id')->on('skins')->onDelete('cascade');
            $table->foreign('wear_id')->references('id')->on('wears')->onDelete('cascade');
        });

        Schema::create('crate_skin', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            
            $table->string('crate_id');  // crate.id must also be a string
            $table->string('skin_id');   // ✅ match skins.id
            $table->timestamps();

            $table->primary(['crate_id', 'skin_id']);

            $table->foreign('crate_id')->references('id')->on('crates')->onDelete('cascade');
            $table->foreign('skin_id')->references('id')->on('skins')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crate_skin');
        Schema::dropIfExists('skin_wear');
    }
};

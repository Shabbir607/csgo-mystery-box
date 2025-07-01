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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'banned', 'verified', 'unverified'])->default('active')->after('role_id');
            $table->boolean('is_verified')->default(false)->after('status');
            $table->date('join_date')->nullable()->after('is_verified');
            $table->timestamp('last_login')->nullable()->after('join_date');
            $table->ipAddress('ip_address')->nullable()->after('last_login');
            $table->string('country')->nullable()->after('ip_address');
            $table->boolean('two_factor_enabled')->default(false)->after('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'is_verified',
                'join_date',
                'last_login',
                'ip_address',
                'country',
                'two_factor_enabled',
            ]);
        });
    }
};

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
        Schema::table('users', function (Blueprint $table) {
            $table->string('cover_photo')->nullable()->after('avatar_url');
            $table->string('cover_photo_url')->nullable()->after('cover_photo');
            $table->unsignedTinyInteger('cover_photo_position_y')->default(50)->after('cover_photo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cover_photo', 'cover_photo_url', 'cover_photo_position_y']);
        });
    }
};

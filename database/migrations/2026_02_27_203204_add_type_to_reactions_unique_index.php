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
        Schema::table('reactions', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropUnique('reactions_post_id_user_id_unique');
            $table->unique(['post_id', 'user_id', 'type']);
            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reactions', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropUnique(['post_id', 'user_id', 'type']);
            $table->unique(['post_id', 'user_id']);
            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
        });
    }
};

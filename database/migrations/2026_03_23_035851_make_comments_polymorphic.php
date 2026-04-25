<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->nullableMorphs('commentable');
        });

        DB::table('comments')->whereNotNull('post_id')->update([
            'commentable_type' => 'App\\Models\\Post',
            'commentable_id' => DB::raw('post_id'),
        ]);

        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropColumn('post_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable()->constrained()->cascadeOnDelete();
        });

        DB::table('comments')->where('commentable_type', 'App\\Models\\Post')->update([
            'post_id' => DB::raw('commentable_id'),
        ]);

        Schema::table('comments', function (Blueprint $table) {
            $table->dropMorphs('commentable');
        });
    }
};

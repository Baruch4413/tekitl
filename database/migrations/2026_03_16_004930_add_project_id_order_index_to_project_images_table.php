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
        Schema::table('project_images', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->index(['project_id', 'order'], 'project_images_project_id_order_index');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('project_images', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropIndex('project_images_project_id_order_index');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }
};

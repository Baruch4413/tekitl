<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_volunteers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'active', 'exhausted', 'bailed'])->default('pending');
            $table->unsignedSmallInteger('hours_committed');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['project_role_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_volunteers');
    }
};

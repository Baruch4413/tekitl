<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable();
            $table->string('location_name')->nullable();
            $table->string('location_place_id')->nullable();
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('public_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->json('languages')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'location_name',
                'location_place_id',
                'location_lat',
                'location_lng',
                'birthdate',
                'public_phone',
                'contact_email',
                'languages',
            ]);
        });
    }
};

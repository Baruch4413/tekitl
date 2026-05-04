<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE project_timeline_events MODIFY type ENUM('role_created', 'volunteer_joined', 'volunteer_bailed', 'volunteer_exhausted', 'milestone', 'status_update', 'photo_uploaded', 'coins_received', 'stage_transition') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE project_timeline_events MODIFY type ENUM('role_created', 'volunteer_joined', 'volunteer_bailed', 'volunteer_exhausted', 'milestone', 'status_update', 'photo_uploaded', 'coins_received') NOT NULL");
    }
};

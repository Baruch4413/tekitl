<?php

namespace App\Observers;

use App\Models\ProjectRole;
use App\Models\ProjectTimelineEvent;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Auth;

class ProjectRoleObserver
{
    public function created(ProjectRole $role): void
    {
        ProjectTimelineEvent::query()->create([
            'project_id' => $role->project_id,
            'user_id' => Auth::id() ?? $role->project->user_id,
            'type' => ProjectTimelineEventType::RoleCreated,
            'data' => [
                'role_id' => $role->id,
                'role_title' => $role->title,
            ],
        ]);
    }
}

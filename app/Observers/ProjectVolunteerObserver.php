<?php

namespace App\Observers;

use App\Models\ProjectTimelineEvent;
use App\Models\ProjectVolunteer;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Auth;

class ProjectVolunteerObserver
{
    public function updated(ProjectVolunteer $volunteer): void
    {
        if (! $volunteer->wasChanged('status')) {
            return;
        }

        $from = $volunteer->getOriginal('status');
        $to = $volunteer->status;
        $project = $volunteer->role->project;

        $type = null;
        $data = [
            'role_id' => $volunteer->role->id,
            'role_title' => $volunteer->role->title,
            'volunteer_id' => $volunteer->id,
            'volunteer_user_id' => $volunteer->user_id,
            'volunteer_name' => $volunteer->user->name,
        ];
        $userId = Auth::id();

        if ($from === 'pending' && $to === 'active') {
            $type = ProjectTimelineEventType::VolunteerJoined;
        } elseif ($from === 'active' && $to === 'bailed') {
            $type = ProjectTimelineEventType::VolunteerBailed;
            $data['reason'] = 'owner_removed';
        } elseif ($from === 'pending' && $to === 'bailed') {
            $type = ProjectTimelineEventType::VolunteerBailed;
            $data['reason'] = 'auto_rejected_terminal_stage';
            // System-driven rejection: leave actor null.
            $userId = null;
        } elseif ($from === 'active' && $to === 'exhausted') {
            $type = ProjectTimelineEventType::VolunteerExhausted;
        }

        if ($type === null) {
            return;
        }

        ProjectTimelineEvent::query()->create([
            'project_id' => $project->id,
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
        ]);
    }
}

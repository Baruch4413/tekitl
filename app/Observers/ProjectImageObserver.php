<?php

namespace App\Observers;

use App\Models\ProjectImage;
use App\Models\ProjectTimelineEvent;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Auth;

class ProjectImageObserver
{
    public function created(ProjectImage $image): void
    {
        ProjectTimelineEvent::query()->create([
            'project_id' => $image->project_id,
            'user_id' => Auth::id() ?? $image->project->user_id,
            'type' => ProjectTimelineEventType::PhotoUploaded,
            'data' => [
                'image_id' => $image->id,
            ],
        ]);
    }
}

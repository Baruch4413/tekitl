<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransitionProjectStageRequest;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\Models\ProjectVolunteer;
use App\ProjectStage;
use App\ProjectTimelineEventType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjectStageController extends Controller
{
    public function store(TransitionProjectStageRequest $request, Project $project): RedirectResponse
    {
        $target = ProjectStage::from($request->validated()['to']);
        $from = $project->stage;

        DB::transaction(function () use ($project, $from, $target): void {
            $project->transitionTo($target);

            ProjectTimelineEvent::query()->create([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'type' => ProjectTimelineEventType::StageTransition,
                'data' => [
                    'from' => $from->value,
                    'to' => $target->value,
                ],
            ]);

            if (in_array($target, [ProjectStage::Completed, ProjectStage::Aborted], true)) {
                $pending = ProjectVolunteer::query()
                    ->whereIn('project_role_id', $project->roles()->pluck('id'))
                    ->where('status', 'pending')
                    ->get();

                foreach ($pending as $volunteer) {
                    $volunteer->update(['status' => 'bailed']);
                }
            }
        });

        return back();
    }
}

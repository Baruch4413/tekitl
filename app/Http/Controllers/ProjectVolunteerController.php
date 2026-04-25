<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectVolunteerRequest;
use App\Http\Requests\UpdateProjectVolunteerRequest;
use App\Models\Project;
use App\Models\ProjectRole;
use App\Models\ProjectVolunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ProjectVolunteerController extends Controller
{
    public function store(StoreProjectVolunteerRequest $request, Project $project, ProjectRole $role): RedirectResponse
    {
        $role->volunteers()->create([
            'user_id' => Auth::id(),
            'status' => 'pending',
            'hours_committed' => $role->hours_estimated,
        ]);

        return back();
    }

    public function update(UpdateProjectVolunteerRequest $request, Project $project, ProjectVolunteer $volunteer): RedirectResponse
    {
        $status = $request->validated()['status'];

        $volunteer->update([
            'status' => $status,
            'joined_at' => $status === 'active' ? now() : null,
        ]);

        return back();
    }

    public function destroy(Project $project, ProjectVolunteer $volunteer): RedirectResponse
    {
        $userId = Auth::id();
        $isOwner = $userId === $project->user_id;
        $isSelf = $userId === $volunteer->user_id;

        abort_unless($isOwner || $isSelf, 403);
        abort_unless($volunteer->role->project_id === $project->id, 404);

        $volunteer->delete();

        return back();
    }
}

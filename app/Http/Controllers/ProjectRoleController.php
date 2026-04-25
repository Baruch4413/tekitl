<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRoleRequest;
use App\Http\Requests\UpdateProjectRoleRequest;
use App\Models\Project;
use App\Models\ProjectRole;
use Illuminate\Http\RedirectResponse;

class ProjectRoleController extends Controller
{
    public function store(StoreProjectRoleRequest $request, Project $project): RedirectResponse
    {
        $project->roles()->create($request->validated());

        return back();
    }

    public function update(UpdateProjectRoleRequest $request, Project $project, ProjectRole $role): RedirectResponse
    {
        $role->update($request->validated());

        return back();
    }

    public function destroy(Project $project, ProjectRole $role): RedirectResponse
    {
        abort_unless(request()->user()->id === $project->user_id, 403);
        abort_unless($role->project_id === $project->id, 404);

        $role->delete();

        return back();
    }
}

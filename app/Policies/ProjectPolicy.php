<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function transition(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }

    public function postMilestone(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }

    public function postStatusUpdate(User $user, Project $project): bool
    {
        return $user->id === $project->user_id;
    }
}

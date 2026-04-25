<?php

namespace App\Http\Requests;

use App\Models\ProjectVolunteer;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectVolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        $role = $this->route('role');

        if ($this->user()->id === $project->user_id) {
            return false;
        }

        if ($role->project_id !== $project->id) {
            return false;
        }

        if ($role->isFull()) {
            return false;
        }

        $alreadyApplied = ProjectVolunteer::query()
            ->whereIn('project_role_id', $project->roles()->pluck('id'))
            ->where('user_id', $this->user()->id)
            ->whereIn('status', ['pending', 'active'])
            ->exists();

        return ! $alreadyApplied;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}

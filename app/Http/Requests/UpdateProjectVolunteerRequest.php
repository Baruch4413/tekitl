<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectVolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        $volunteer = $this->route('volunteer');

        return $this->user()->id === $project->user_id
            && $volunteer->role->project_id === $project->id;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:active,bailed'],
        ];
    }
}

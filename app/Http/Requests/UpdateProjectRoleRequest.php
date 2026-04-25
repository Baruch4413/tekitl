<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        $role = $this->route('role');

        return $this->user()->id === $project->user_id
            && $role->project_id === $project->id;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'slots' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'hours_estimated' => ['sometimes', 'integer', 'min:1', 'max:10000'],
        ];
    }
}

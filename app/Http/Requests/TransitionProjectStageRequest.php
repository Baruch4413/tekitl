<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\ProjectStage;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TransitionProjectStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return $this->user()?->can('transition', $project) ?? false;
    }

    /**
     * @return array<string, array<int, string|ValidationRule|Closure>>
     */
    public function rules(): array
    {
        /** @var Project $project */
        $project = $this->route('project');

        return [
            'to' => [
                'required',
                'string',
                function (string $attribute, mixed $value, Closure $fail) use ($project): void {
                    $target = ProjectStage::tryFrom(is_string($value) ? $value : '');

                    if ($target === null) {
                        $fail('La etapa solicitada no existe.');

                        return;
                    }

                    if (! $project->canTransitionTo($target)) {
                        $fail('Esta transición no está permitida desde el estado actual.');
                    }
                },
            ],
        ];
    }
}

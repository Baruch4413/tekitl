<?php

namespace App\Http\Requests;

use App\ConfidenceLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTalentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        $occupations = array_filter(explode("\n", file_get_contents(base_path('ocupaciones.txt'))));

        return [
            'occupation' => ['required', 'string', Rule::in($occupations)],
            'confidence_level' => ['required', Rule::enum(ConfidenceLevel::class)],
            'experience_years' => ['required', 'integer', Rule::in([0, 1, 3, 5, 10])],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('project')->user_id;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'slots' => ['required', 'integer', 'min:1', 'max:500'],
            'hours_estimated' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }
}

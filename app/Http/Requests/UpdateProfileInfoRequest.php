<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileInfoRequest extends FormRequest
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
        return [
            'bio' => ['nullable', 'string', 'max:500'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'location_place_id' => ['nullable', 'string', 'max:255'],
            'location_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'public_phone' => ['nullable', 'string', 'max:20'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'languages' => ['nullable', 'array', 'max:10'],
            'languages.*' => ['string', 'max:50'],
        ];
    }
}

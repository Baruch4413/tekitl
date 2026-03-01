<?php

namespace Database\Factories;

use App\ConfidenceLevel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserTalent>
 */
class UserTalentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $occupations = array_filter(explode("\n", file_get_contents(base_path('ocupaciones.txt'))));

        return [
            'user_id' => User::factory(),
            'occupation' => fake()->randomElement($occupations),
            'confidence_level' => fake()->randomElement(ConfidenceLevel::cases()),
            'experience_years' => fake()->randomElement([0, 1, 3, 5, 10]),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\ProjectRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectVolunteer>
 */
class ProjectVolunteerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_role_id' => ProjectRole::factory(),
            'user_id' => User::factory(),
            'status' => 'pending',
            'hours_committed' => fake()->numberBetween(5, 100),
            'joined_at' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active', 'joined_at' => now()]);
    }
}

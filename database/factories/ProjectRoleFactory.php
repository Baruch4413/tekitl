<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectRole>
 */
class ProjectRoleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->optional()->sentence(),
            'slots' => fake()->numberBetween(1, 10),
            'hours_estimated' => fake()->numberBetween(5, 100),
        ];
    }
}

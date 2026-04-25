<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use App\ProjectStage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'post_id' => Post::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'goal' => fake()->numberBetween(100, 10000),
            'stage' => ProjectStage::Planning,
        ];
    }
}

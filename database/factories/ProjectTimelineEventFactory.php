<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\ProjectTimelineEventType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectTimelineEvent>
 */
class ProjectTimelineEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'type' => ProjectTimelineEventType::StatusUpdate,
            'data' => ['body' => fake()->sentence()],
        ];
    }

    public function roleCreated(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::RoleCreated,
            'data' => ['role_id' => 1, 'role_title' => fake()->jobTitle()],
        ]);
    }

    public function volunteerJoined(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::VolunteerJoined,
            'data' => [
                'role_id' => 1,
                'role_title' => fake()->jobTitle(),
                'volunteer_id' => 1,
                'volunteer_user_id' => 1,
                'volunteer_name' => fake()->name(),
            ],
        ]);
    }

    public function volunteerBailed(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::VolunteerBailed,
            'data' => [
                'role_id' => 1,
                'role_title' => fake()->jobTitle(),
                'volunteer_id' => 1,
                'volunteer_user_id' => 1,
                'volunteer_name' => fake()->name(),
                'reason' => 'owner_removed',
            ],
        ]);
    }

    public function volunteerAutoRejected(): static
    {
        return $this->state(fn (): array => [
            'user_id' => null,
            'type' => ProjectTimelineEventType::VolunteerBailed,
            'data' => [
                'role_id' => 1,
                'role_title' => fake()->jobTitle(),
                'volunteer_id' => 1,
                'volunteer_user_id' => 1,
                'volunteer_name' => fake()->name(),
                'reason' => 'auto_rejected_terminal_stage',
            ],
        ]);
    }

    public function volunteerExhausted(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::VolunteerExhausted,
            'data' => [
                'role_id' => 1,
                'role_title' => fake()->jobTitle(),
                'volunteer_id' => 1,
                'volunteer_user_id' => 1,
                'volunteer_name' => fake()->name(),
            ],
        ]);
    }

    public function milestone(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::Milestone,
            'data' => ['title' => fake()->sentence(6)],
        ]);
    }

    public function statusUpdate(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::StatusUpdate,
            'data' => ['body' => fake()->paragraph()],
        ]);
    }

    public function photoUploaded(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::PhotoUploaded,
            'data' => ['image_id' => 1],
        ]);
    }

    public function coinsReceived(): static
    {
        return $this->state(fn (): array => [
            'user_id' => null,
            'type' => ProjectTimelineEventType::CoinsReceived,
            'data' => [
                'coins' => fake()->numberBetween(1, 100),
                'window_started_at' => now()->toIso8601String(),
            ],
        ]);
    }

    public function stageTransition(): static
    {
        return $this->state(fn (): array => [
            'type' => ProjectTimelineEventType::StageTransition,
            'data' => ['from' => 'planning', 'to' => 'in_execution'],
        ]);
    }
}

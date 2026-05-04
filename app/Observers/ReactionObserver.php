<?php

namespace App\Observers;

use App\Models\ProjectTimelineEvent;
use App\Models\Reaction;
use App\ProjectTimelineEventType;
use App\ReactionType;
use Illuminate\Support\Facades\DB;

class ReactionObserver
{
    private const COINS_PER_ENDORSEMENT = 10;

    private const AGGREGATION_WINDOW_MINUTES = 60;

    public function created(Reaction $reaction): void
    {
        if ($reaction->type !== ReactionType::Potenciar) {
            return;
        }

        $project = $reaction->post?->project;

        if (! $project) {
            return;
        }

        DB::transaction(function () use ($project): void {
            $existing = ProjectTimelineEvent::query()
                ->where('project_id', $project->id)
                ->where('type', ProjectTimelineEventType::CoinsReceived)
                ->where('created_at', '>=', now()->subMinutes(self::AGGREGATION_WINDOW_MINUTES))
                ->orderByDesc('created_at')
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $data = $existing->data;
                $data['coins'] = ($data['coins'] ?? 0) + self::COINS_PER_ENDORSEMENT;
                $existing->update(['data' => $data]);

                return;
            }

            ProjectTimelineEvent::query()->create([
                'project_id' => $project->id,
                'user_id' => null,
                'type' => ProjectTimelineEventType::CoinsReceived,
                'data' => [
                    'coins' => self::COINS_PER_ENDORSEMENT,
                    'window_started_at' => now()->toIso8601String(),
                ],
            ]);
        });
    }
}

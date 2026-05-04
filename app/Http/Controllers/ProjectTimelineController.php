<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectMilestoneRequest;
use App\Http\Requests\StoreProjectStatusUpdateRequest;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\ProjectTimelineEventType;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectTimelineController extends Controller
{
    private const DEFAULT_LIMIT = 20;

    private const MAX_LIMIT = 50;

    public function index(Request $request, Project $project): JsonResponse
    {
        $limit = (int) $request->integer('limit', self::DEFAULT_LIMIT);
        $limit = max(1, min($limit, self::MAX_LIMIT));

        $query = ProjectTimelineEvent::query()
            ->where('project_id', $project->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($cursor = $request->string('cursor')->toString()) {
            [$cursorTs, $cursorId] = $this->parseCursor($cursor);
            $query->where(function ($q) use ($cursorTs, $cursorId): void {
                $q->where('created_at', '<', $cursorTs)
                    ->orWhere(function ($q) use ($cursorTs, $cursorId): void {
                        $q->where('created_at', '=', $cursorTs)
                            ->where('id', '<', $cursorId);
                    });
            });
        }

        $entries = $query->limit($limit + 1)->get();

        $hasMore = $entries->count() > $limit;
        $page = $entries->take($limit);

        $nextCursor = $hasMore && $page->isNotEmpty()
            ? $page->last()->created_at->toIso8601String().'|'.$page->last()->id
            : null;

        return response()->json([
            'entries' => $page->map(fn (ProjectTimelineEvent $e) => $this->transform($e))->values(),
            'nextCursor' => $nextCursor,
        ]);
    }

    public function storeMilestone(StoreProjectMilestoneRequest $request, Project $project): RedirectResponse
    {
        ProjectTimelineEvent::query()->create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'type' => ProjectTimelineEventType::Milestone,
            'data' => ['title' => $request->validated('title')],
        ]);

        return back();
    }

    public function storeStatusUpdate(StoreProjectStatusUpdateRequest $request, Project $project): RedirectResponse
    {
        ProjectTimelineEvent::query()->create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'type' => ProjectTimelineEventType::StatusUpdate,
            'data' => ['body' => $request->validated('body')],
        ]);

        return back();
    }

    /**
     * @return array{0: CarbonImmutable, 1: int}
     */
    private function parseCursor(string $cursor): array
    {
        [$ts, $id] = array_pad(explode('|', $cursor, 2), 2, '');

        return [CarbonImmutable::parse($ts), (int) $id];
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(ProjectTimelineEvent $event): array
    {
        return [
            'id' => $event->id,
            'type' => $event->type->value,
            'data' => $event->data,
            'createdAt' => $event->created_at->toIso8601String(),
            'createdAtRelative' => $event->created_at->diffForHumans(),
            'actor' => $event->user ? [
                'id' => $event->user->id,
                'name' => $event->user->name,
                'avatarUrl' => $event->user->avatar_url,
            ] : null,
        ];
    }
}

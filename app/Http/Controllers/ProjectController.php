<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProjectRequest;
use App\Http\Requests\UploadProjectImageRequest;
use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\ProjectRole;
use App\Models\ProjectVolunteer;
use App\ProjectImageSize;
use App\ReactionType;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function show(Post $post): Response
    {
        $userId = Auth::id();

        $project = $post->project;

        if (! $project) {
            abort_unless($userId && $post->user_id === $userId, 404);

            $project = Project::query()->create([
                'post_id' => $post->id,
                'user_id' => $userId,
                'title' => Str::limit($post->body, 252),
                'description' => null,
                'goal' => 100,
            ]);
        }

        $isOwner = $userId && $userId === $project->user_id;

        $project->load([
            'images',
            'roles.activeVolunteers.user',
            'roles.pendingVolunteers.user',
        ]);
        $post->load('user');

        if ($userId) {
            $post->loadExists([
                'reactions as is_powered_by_current_user' => fn ($q) => $q->where('user_id', $userId)->where('type', ReactionType::Potenciar),
            ]);
        }

        $currentUserApplication = $userId
            ? ProjectVolunteer::query()
                ->whereIn('project_role_id', $project->roles->pluck('id'))
                ->where('user_id', $userId)
                ->whereIn('status', ['pending', 'active'])
                ->first()
            : null;

        $s3 = Storage::disk('s3');

        return Inertia::render('proyectos/show', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'goal' => $project->goal,
                'roles' => $project->roles->map(fn (ProjectRole $role) => [
                    'id' => $role->id,
                    'title' => $role->title,
                    'description' => $role->description,
                    'slots' => $role->slots,
                    'hoursEstimated' => $role->hours_estimated,
                    'filledSlots' => $role->activeVolunteers->count(),
                    'volunteers' => $role->activeVolunteers->map(fn (ProjectVolunteer $v) => [
                        'id' => $v->id,
                        'userId' => $v->user_id,
                        'name' => $v->user->name,
                        'avatarUrl' => $v->user->avatar_url,
                    ]),
                    'pendingApplicants' => $isOwner
                        ? $role->pendingVolunteers->map(fn (ProjectVolunteer $v) => [
                            'id' => $v->id,
                            'userId' => $v->user_id,
                            'name' => $v->user->name,
                            'avatarUrl' => $v->user->avatar_url,
                        ])
                        : [],
                ]),
                'images' => $project->images->map(fn (ProjectImage $image) => [
                    'id' => $image->id,
                    'title' => $image->title,
                    'description' => $image->description,
                    'thumbnailUrl' => $s3->url("{$image->path}-thumbnail.webp"),
                    'mediumUrl' => $s3->url("{$image->path}-medium.webp"),
                    'largeUrl' => $s3->url("{$image->path}-large.webp"),
                ]),
            ],
            'post' => [
                'id' => $post->id,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'imageUrl' => $post->user->avatar_url,
                ],
                'content' => $post->body,
                'date' => $post->created_at->diffForHumans(),
                'dateTime' => $post->created_at->toIso8601String(),
                'coins' => $post->coins,
                'isPoweredByCurrentUser' => (bool) ($post->is_powered_by_current_user ?? false),
            ],
            'isOwner' => $isOwner,
            'currentUserApplication' => $currentUserApplication ? [
                'id' => $currentUserApplication->id,
                'roleId' => $currentUserApplication->project_role_id,
                'status' => $currentUserApplication->status,
            ] : null,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());

        return back();
    }

    public function uploadImage(UploadProjectImageRequest $request, Project $project, ImageService $imageService): RedirectResponse
    {
        $basePath = $imageService->processProjectImage($request->file('image'));

        $maxOrder = $project->images()->max('order') ?? -1;

        $project->images()->create([
            'path' => $basePath,
            'order' => $maxOrder + 1,
        ]);

        return back();
    }

    public function updateImage(Project $project, ProjectImage $image): RedirectResponse
    {
        abort_unless(Auth::id() === $project->user_id, 403);
        abort_unless($image->project_id === $project->id, 404);

        $image->update(request()->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]));

        return back();
    }

    public function deleteImage(Project $project, ProjectImage $image, ImageService $imageService): RedirectResponse
    {
        abort_unless(Auth::id() === $project->user_id, 403);
        abort_unless($image->project_id === $project->id, 404);

        $imageService->deleteVariants($image->path, array_column(ProjectImageSize::cases(), 'value'));
        $image->delete();

        return back();
    }
}

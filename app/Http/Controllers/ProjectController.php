<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProjectRequest;
use App\Http\Requests\UploadProjectImageRequest;
use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectImage;
use App\ProjectImageSize;
use App\ReactionType;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function show(Post $post): Response
    {
        $userId = Auth::id();

        $project = $post->project;

        if (! $project) {
            abort_unless($post->user_id === $userId, 403);

            $project = Project::query()->create([
                'post_id' => $post->id,
                'user_id' => $userId,
                'title' => null,
                'description' => null,
                'goal' => 100,
            ]);
        }

        $project->load('images');
        $post->load('user');

        $post->loadCount([
            'comments',
            'reactions as likes_count' => fn ($q) => $q->where('type', ReactionType::Like),
        ]);

        if ($userId) {
            $post->loadExists([
                'reactions as is_liked' => fn ($q) => $q->where('user_id', $userId)->where('type', ReactionType::Like),
                'reactions as is_powered_by_current_user' => fn ($q) => $q->where('user_id', $userId)->where('type', ReactionType::Potenciar),
            ]);
        }

        $s3 = Storage::disk('s3');

        return Inertia::render('proyectos/show', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'goal' => $project->goal,
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
                'likes' => $post->likes_count,
                'isLiked' => (bool) ($post->is_liked ?? false),
                'isPoweredByCurrentUser' => (bool) ($post->is_powered_by_current_user ?? false),
                'comments' => $post->comments_count,
            ],
            'isOwner' => $userId && $userId === $project->user_id,
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

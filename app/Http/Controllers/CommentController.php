<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    public function postIndex(Post $post): JsonResponse
    {
        return $this->indexFor($post);
    }

    public function postStore(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        return $this->storeFor($request, $post);
    }

    public function projectIndex(Project $project): JsonResponse
    {
        return $this->indexFor($project);
    }

    public function projectStore(StoreCommentRequest $request, Project $project): RedirectResponse
    {
        return $this->storeFor($request, $project);
    }

    private function indexFor(Model $commentable): JsonResponse
    {
        $comments = $commentable->comments()->with('user')->oldest()->get();

        return response()->json($comments->map(fn ($comment) => [
            'id' => $comment->id,
            'user' => ['name' => $comment->user->name, 'imageUrl' => $comment->user->avatar_url],
            'body' => $comment->body,
            'date' => $comment->created_at->diffForHumans(),
            'dateTime' => $comment->created_at->toIso8601String(),
        ]));
    }

    private function storeFor(StoreCommentRequest $request, Model $commentable): RedirectResponse
    {
        $commentable->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return back();
    }
}

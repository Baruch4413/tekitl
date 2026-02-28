<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class CommentController extends Controller
{
    public function index(Post $post): JsonResponse
    {
        $comments = $post->comments()->with('user')->oldest()->get();

        return response()->json($comments->map(fn ($comment) => [
            'id' => $comment->id,
            'user' => ['name' => $comment->user->name, 'imageUrl' => $comment->user->avatar_url],
            'body' => $comment->body,
            'date' => $comment->created_at->diffForHumans(),
            'dateTime' => $comment->created_at->toIso8601String(),
        ]));
    }

    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $post->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        return back();
    }
}

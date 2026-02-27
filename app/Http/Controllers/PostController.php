<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        $posts = Post::with(['user', 'comments.user'])->latest()->get()->map(fn (Post $post) => [
            'id' => $post->id,
            'user' => ['name' => $post->user->name, 'imageUrl' => null],
            'content' => $post->body,
            'date' => $post->created_at->diffForHumans(),
            'dateTime' => $post->created_at->toIso8601String(),
            'likes' => 0,
            'comments' => $post->comments->count(),
            'reposts' => 0,
            'commentsList' => $post->comments->sortBy('created_at')->values()->map(fn ($comment) => [
                'id' => $comment->id,
                'user' => ['name' => $comment->user->name, 'imageUrl' => null],
                'body' => $comment->body,
                'date' => $comment->created_at->diffForHumans(),
                'dateTime' => $comment->created_at->toIso8601String(),
            ]),
        ]);

        return Inertia::render('welcome', ['posts' => $posts]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $request->user()->posts()->create($request->validated());

        return back();
    }
}

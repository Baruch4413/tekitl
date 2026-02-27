<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\ReactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        $posts = Post::with(['user', 'comments.user', 'reactions'])->latest()->get()->map(fn (Post $post) => [
            'id' => $post->id,
            'user' => ['name' => $post->user->name, 'imageUrl' => null],
            'content' => $post->body,
            'date' => $post->created_at->diffForHumans(),
            'dateTime' => $post->created_at->toIso8601String(),
            'coins' => $post->coins,
            'likes' => $post->reactions->where('type', ReactionType::Like)->count(),
            'isLiked' => $userId ? $post->reactions->contains(fn ($r) => $r->user_id === $userId && $r->type === ReactionType::Like) : false,
            'comments' => $post->comments->count(),
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

    public function potenciar(Post $post): RedirectResponse
    {
        $post->increment('coins', 10);

        return back();
    }

    public function toggleLike(Post $post): RedirectResponse
    {
        $deleted = $post->reactions()
            ->where('user_id', Auth::id())
            ->where('type', ReactionType::Like)
            ->delete();

        if (! $deleted) {
            $post->reactions()->create([
                'user_id' => Auth::id(),
                'type' => ReactionType::Like,
            ]);
        }

        return back();
    }
}

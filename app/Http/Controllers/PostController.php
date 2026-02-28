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

        $posts = Post::with(['user'])
            ->withCount([
                'comments',
                'reactions as likes_count' => fn ($q) => $q->where('type', ReactionType::Like),
            ])
            ->when($userId, fn ($query) => $query
                ->withExists(['reactions as is_liked' => fn ($q) => $q->where('user_id', $userId)->where('type', ReactionType::Like)])
                ->withExists(['reactions as is_powered_by_current_user' => fn ($q) => $q->where('user_id', $userId)->where('type', ReactionType::Potenciar)])
            )
            ->latest()
            ->cursorPaginate(15);

        $posts->through(fn (Post $post) => [
            'id' => $post->id,
            'user' => ['name' => $post->user->name, 'imageUrl' => $post->user->avatar_url],
            'content' => $post->body,
            'date' => $post->created_at->diffForHumans(),
            'dateTime' => $post->created_at->toIso8601String(),
            'coins' => $post->coins,
            'likes' => $post->likes_count,
            'isLiked' => (bool) $post->is_liked,
            'isPoweredByCurrentUser' => (bool) $post->is_powered_by_current_user,
            'comments' => $post->comments_count,
        ]);

        return Inertia::render('welcome', [
            'posts' => Inertia::scroll($posts),
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $request->user()->posts()->create($request->validated());

        return back();
    }

    public function potenciar(Post $post): RedirectResponse
    {
        $post->increment('coins', 10);

        $post->reactions()->firstOrCreate([
            'user_id' => Auth::id(),
            'type' => ReactionType::Potenciar,
        ]);

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

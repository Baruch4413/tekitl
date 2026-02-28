<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use App\ReactionType;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function show(User $user): Response
    {
        $userId = Auth::id();

        $posts = Post::with(['user'])
            ->where('user_id', $user->id)
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
            'user' => ['id' => $post->user->id, 'name' => $post->user->name, 'imageUrl' => $post->user->avatar_url],
            'content' => $post->body,
            'date' => $post->created_at->diffForHumans(),
            'dateTime' => $post->created_at->toIso8601String(),
            'coins' => $post->coins,
            'likes' => $post->likes_count,
            'isLiked' => (bool) $post->is_liked,
            'isPoweredByCurrentUser' => (bool) $post->is_powered_by_current_user,
            'comments' => $post->comments_count,
        ]);

        return Inertia::render('users/show', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatarUrl' => $user->avatar_url,
                'createdAt' => $user->created_at->translatedFormat('F Y'),
                'postsCount' => $user->posts()->count(),
                'coins' => $user->posts()->sum('coins'),
            ],
            'posts' => Inertia::scroll($posts),
        ]);
    }
}

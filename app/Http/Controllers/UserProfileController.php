<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\CoverPhotoPositionRequest;
use App\Http\Requests\Settings\CoverPhotoUploadRequest;
use App\Models\Post;
use App\Models\User;
use App\ReactionType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        $isOwner = $userId && $userId === $user->id;

        return Inertia::render('users/show', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatarUrl' => $user->avatar_url,
                'coverPhotoUrl' => $user->cover_photo_url,
                'coverPhotoPositionY' => $user->cover_photo_position_y,
                'createdAt' => $user->created_at->locale('es')->translatedFormat('F Y'),
                'postsCount' => $user->posts()->count(),
                'coins' => $user->posts()->sum('coins'),
                'bio' => $user->bio,
                'locationName' => $user->location_name,
                'birthdate' => $user->birthdate?->toDateString(),
                'publicPhone' => $user->public_phone,
                'contactEmail' => $user->contact_email,
                'languages' => $user->languages,
                'locationPlaceId' => $user->location_place_id,
                'locationLat' => $user->location_lat ? (float) $user->location_lat : null,
                'locationLng' => $user->location_lng ? (float) $user->location_lng : null,
            ],
            'talents' => $user->talents->map(fn ($talent) => [
                'id' => $talent->id,
                'occupation' => $talent->occupation,
                'confidenceLevel' => $talent->confidence_level->value,
                'experienceYears' => $talent->experience_years,
            ])->values(),
            'occupations' => Inertia::lazy(fn () => array_values(array_filter(explode("\n", file_get_contents(base_path('ocupaciones.txt')))))),
            'posts' => Inertia::scroll($posts),
            'googleMapsApiKey' => $isOwner ? config('services.google_maps.api_key') : null,
        ]);
    }

    public function uploadCoverPhoto(CoverPhotoUploadRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->cover_photo) {
            Storage::disk('s3')->delete($user->cover_photo);
        }

        $path = $request->file('cover_photo')->store('covers', 's3');

        $user->update([
            'cover_photo' => $path,
            'cover_photo_position_y' => 50,
        ]);

        return back();
    }

    public function updateCoverPhotoPosition(CoverPhotoPositionRequest $request): RedirectResponse
    {
        $request->user()->update([
            'cover_photo_position_y' => $request->validated('cover_photo_position_y'),
        ]);

        return back();
    }
}

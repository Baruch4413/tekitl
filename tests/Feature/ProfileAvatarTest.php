<?php

use App\AvatarSize;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('guests cannot upload an avatar', function () {
    $this->post(route('profile.avatar'), [
        'avatar' => UploadedFile::fake()->image('avatar.jpg'),
    ])->assertRedirect(route('login'));
});

test('authenticated users can upload an avatar', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
        ])
        ->assertRedirect();

    $user->refresh();

    expect($user->avatar)->not->toBeNull();

    foreach (AvatarSize::cases() as $size) {
        Storage::disk('s3')->assertExists("{$user->avatar}-{$size->value}.webp");
    }
});

test('avatar must be an image', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->create('document.pdf', 100),
        ])
        ->assertInvalid(['avatar']);
});

test('avatar must not exceed 4MB', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('avatar.jpg')->size(5120),
        ])
        ->assertInvalid(['avatar']);
});

test('uploading a new avatar deletes the old one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('old.jpg', 200, 200),
        ]);

    $oldBasePath = $user->refresh()->avatar;

    foreach (AvatarSize::cases() as $size) {
        Storage::disk('s3')->assertExists("{$oldBasePath}-{$size->value}.webp");
    }

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('new.jpg', 200, 200),
        ]);

    $user->refresh();

    foreach (AvatarSize::cases() as $size) {
        Storage::disk('s3')->assertMissing("{$oldBasePath}-{$size->value}.webp");
        Storage::disk('s3')->assertExists("{$user->avatar}-{$size->value}.webp");
    }

    expect($user->avatar)->not->toBe($oldBasePath);
});

test('avatar_url points to medium variant when avatar exists', function () {
    $user = User::factory()->create(['avatar' => 'avatars/test123']);

    expect($user->avatar_url)->toContain('avatars/test123-medium.webp');
});

test('avatar_url accessor returns null when no avatar', function () {
    $user = User::factory()->create(['avatar' => null]);

    expect($user->avatar_url)->toBeNull();
});

test('profile page returns avatarBaseUrl and avatarOriginalUrl when avatar exists', function () {
    $user = User::factory()->create(['avatar' => 'avatars/abc123']);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('profileUser.avatarBaseUrl', fn ($value) => str_contains($value, 'avatars/abc123'))
            ->where('profileUser.avatarOriginalUrl', fn ($value) => str_contains($value, 'avatars/abc123-original.webp'))
        );
});

test('profile page returns null avatar urls when no avatar', function () {
    $user = User::factory()->create(['avatar' => null]);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('profileUser.avatarBaseUrl', null)
            ->where('profileUser.avatarOriginalUrl', null)
        );
});

<?php

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
    Storage::disk('s3')->assertExists($user->avatar);
});

test('avatar must be an image', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->create('document.pdf', 100),
        ])
        ->assertInvalid(['avatar']);
});

test('avatar must not exceed 1MB', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('avatar.jpg')->size(2048),
        ])
        ->assertInvalid(['avatar']);
});

test('uploading a new avatar deletes the old one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('old.jpg', 200, 200),
        ]);

    $oldPath = $user->refresh()->avatar;
    Storage::disk('s3')->assertExists($oldPath);

    $this->actingAs($user)
        ->post(route('profile.avatar'), [
            'avatar' => UploadedFile::fake()->image('new.jpg', 200, 200),
        ]);

    $user->refresh();

    Storage::disk('s3')->assertMissing($oldPath);
    Storage::disk('s3')->assertExists($user->avatar);
    expect($user->avatar)->not->toBe($oldPath);
});

test('avatar_url accessor returns full url when avatar exists', function () {
    $user = User::factory()->create(['avatar' => 'avatars/test.jpg']);

    expect($user->avatar_url)->toContain('avatars/test.jpg');
});

test('avatar_url accessor returns null when no avatar', function () {
    $user = User::factory()->create(['avatar' => null]);

    expect($user->avatar_url)->toBeNull();
});

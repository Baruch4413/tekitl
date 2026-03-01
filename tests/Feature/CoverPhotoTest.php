<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('guests cannot upload a cover photo', function () {
    $this->post(route('users.cover-photo.upload'), [
        'cover_photo' => UploadedFile::fake()->image('cover.jpg'),
    ])->assertRedirect(route('login'));
});

test('authenticated users can upload a cover photo', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('users.cover-photo.upload'), [
            'cover_photo' => UploadedFile::fake()->image('cover.jpg', 1200, 400),
        ])
        ->assertRedirect();

    $user->refresh();

    expect($user->cover_photo)->not->toBeNull();
    expect($user->cover_photo_position_y)->toBe(50);
    Storage::disk('s3')->assertExists($user->cover_photo);
});

test('cover photo must be an image', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('users.cover-photo.upload'), [
            'cover_photo' => UploadedFile::fake()->create('document.pdf', 100),
        ])
        ->assertInvalid(['cover_photo']);
});

test('cover photo must not exceed 3MB', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('users.cover-photo.upload'), [
            'cover_photo' => UploadedFile::fake()->image('cover.jpg')->size(4096),
        ])
        ->assertInvalid(['cover_photo']);
});

test('uploading a new cover photo deletes the old one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('users.cover-photo.upload'), [
            'cover_photo' => UploadedFile::fake()->image('old.jpg', 1200, 400),
        ]);

    $oldPath = $user->refresh()->cover_photo;
    Storage::disk('s3')->assertExists($oldPath);

    $this->actingAs($user)
        ->post(route('users.cover-photo.upload'), [
            'cover_photo' => UploadedFile::fake()->image('new.jpg', 1200, 400),
        ]);

    $user->refresh();

    Storage::disk('s3')->assertMissing($oldPath);
    Storage::disk('s3')->assertExists($user->cover_photo);
    expect($user->cover_photo)->not->toBe($oldPath);
});

test('guests cannot update cover photo position', function () {
    $this->patch(route('users.cover-photo.position'), [
        'cover_photo_position_y' => 30,
    ])->assertRedirect(route('login'));
});

test('authenticated users can update cover photo position', function () {
    $user = User::factory()->create(['cover_photo_position_y' => 50]);

    $this->actingAs($user)
        ->patch(route('users.cover-photo.position'), [
            'cover_photo_position_y' => 25,
        ])
        ->assertRedirect();

    expect($user->refresh()->cover_photo_position_y)->toBe(25);
});

test('cover photo position must be between 0 and 100', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.cover-photo.position'), [
            'cover_photo_position_y' => -1,
        ])
        ->assertInvalid(['cover_photo_position_y']);

    $this->actingAs($user)
        ->patch(route('users.cover-photo.position'), [
            'cover_photo_position_y' => 101,
        ])
        ->assertInvalid(['cover_photo_position_y']);
});

test('profile page returns cover photo data', function () {
    $user = User::factory()->create([
        'cover_photo' => 'covers/test.jpg',
        'cover_photo_position_y' => 30,
    ]);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->where('profileUser.coverPhotoPositionY', 30)
            ->where('profileUser.coverPhotoUrl', fn ($value) => str_contains($value, 'covers/test.jpg'))
        );
});

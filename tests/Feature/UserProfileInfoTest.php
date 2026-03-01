<?php

use App\Models\User;
use App\Models\UserTalent;

test('guests cannot update profile info', function () {
    $this->patch(route('users.profile-info.update'), [
        'bio' => 'Hello world',
    ])->assertRedirect(route('login'));
});

test('authenticated user can update profile info', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [
            'bio' => 'Me gusta programar',
            'location_name' => 'Guadalajara, Jalisco, México',
            'location_place_id' => 'ChIJZ3v8-DapKIQRjIKVGaGjwQg',
            'location_lat' => 20.6596988,
            'location_lng' => -103.3496092,
            'birthdate' => '1995-06-15',
            'public_phone' => '+52 33 1234 5678',
            'contact_email' => 'contacto@ejemplo.com',
            'languages' => ['Español', 'Inglés'],
        ])
        ->assertRedirect();

    $user->refresh();
    expect($user->bio)->toBe('Me gusta programar');
    expect($user->location_name)->toBe('Guadalajara, Jalisco, México');
    expect($user->location_place_id)->toBe('ChIJZ3v8-DapKIQRjIKVGaGjwQg');
    expect($user->birthdate->toDateString())->toBe('1995-06-15');
    expect($user->public_phone)->toBe('+52 33 1234 5678');
    expect($user->contact_email)->toBe('contacto@ejemplo.com');
    expect($user->languages)->toBe(['Español', 'Inglés']);
});

test('all profile info fields are optional', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [])
        ->assertRedirect();
});

test('bio must not exceed 500 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [
            'bio' => str_repeat('a', 501),
        ])
        ->assertInvalid(['bio']);
});

test('birthdate must be in the past', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [
            'birthdate' => now()->addDay()->toDateString(),
        ])
        ->assertInvalid(['birthdate']);
});

test('contact email must be valid', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [
            'contact_email' => 'not-an-email',
        ])
        ->assertInvalid(['contact_email']);
});

test('languages must be an array with max 10 items', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('users.profile-info.update'), [
            'languages' => array_fill(0, 11, 'Español'),
        ])
        ->assertInvalid(['languages']);
});

test('profile page returns talents data', function () {
    $user = User::factory()->create();
    UserTalent::factory()->create([
        'user_id' => $user->id,
        'occupation' => 'Chef',
        'confidence_level' => 'aprendiz',
        'experience_years' => 3,
    ]);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->has('talents', 1)
            ->where('talents.0.occupation', 'Chef')
            ->where('talents.0.confidenceLevel', 'aprendiz')
            ->where('talents.0.experienceYears', 3)
        );
});

test('profile page returns profile info', function () {
    $user = User::factory()->create([
        'bio' => 'Test bio',
        'location_name' => 'CDMX',
        'languages' => ['Español'],
    ]);

    $this->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->where('profileUser.bio', 'Test bio')
            ->where('profileUser.locationName', 'CDMX')
            ->where('profileUser.languages', ['Español'])
        );
});

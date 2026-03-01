<?php

use App\Models\User;
use App\Models\UserTalent;

test('guests cannot store a talent', function () {
    $this->post(route('talents.store'), [
        'occupation' => 'Chef',
        'confidence_level' => 'aprendiz',
        'experience_years' => 1,
    ])->assertRedirect(route('login'));
});

test('guests cannot update a talent', function () {
    $talent = UserTalent::factory()->create();

    $this->patch(route('talents.update', $talent), [
        'occupation' => 'Chef',
        'confidence_level' => 'maestro',
        'experience_years' => 5,
    ])->assertRedirect(route('login'));
});

test('guests cannot delete a talent', function () {
    $talent = UserTalent::factory()->create();

    $this->delete(route('talents.destroy', $talent))
        ->assertRedirect(route('login'));
});

test('authenticated user can add a talent', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('talents.store'), [
            'occupation' => 'Chef',
            'confidence_level' => 'aprendiz',
            'experience_years' => 1,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_talents', [
        'user_id' => $user->id,
        'occupation' => 'Chef',
        'confidence_level' => 'aprendiz',
        'experience_years' => 1,
    ]);
});

test('talent requires a valid occupation from the list', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('talents.store'), [
            'occupation' => 'Astronauta Intergaláctico',
            'confidence_level' => 'aprendiz',
            'experience_years' => 1,
        ])
        ->assertInvalid(['occupation']);
});

test('talent requires a valid confidence level', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('talents.store'), [
            'occupation' => 'Chef',
            'confidence_level' => 'experto',
            'experience_years' => 1,
        ])
        ->assertInvalid(['confidence_level']);
});

test('talent requires valid experience years', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('talents.store'), [
            'occupation' => 'Chef',
            'confidence_level' => 'aprendiz',
            'experience_years' => 7,
        ])
        ->assertInvalid(['experience_years']);
});

test('cannot add duplicate occupation', function () {
    $user = User::factory()->create();

    UserTalent::factory()->create([
        'user_id' => $user->id,
        'occupation' => 'Chef',
    ]);

    $this->actingAs($user)
        ->post(route('talents.store'), [
            'occupation' => 'Chef',
            'confidence_level' => 'maestro',
            'experience_years' => 5,
        ]);

    expect($user->talents()->where('occupation', 'Chef')->count())->toBe(1);
});

test('user can update own talent', function () {
    $user = User::factory()->create();
    $talent = UserTalent::factory()->create([
        'user_id' => $user->id,
        'occupation' => 'Chef',
        'confidence_level' => 'aprendiz',
        'experience_years' => 1,
    ]);

    $this->actingAs($user)
        ->patch(route('talents.update', $talent), [
            'occupation' => 'Programador',
            'confidence_level' => 'maestro',
            'experience_years' => 10,
        ])
        ->assertRedirect();

    $talent->refresh();
    expect($talent->occupation)->toBe('Programador');
    expect($talent->confidence_level->value)->toBe('maestro');
    expect($talent->experience_years)->toBe(10);
});

test('user cannot update another users talent', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $talent = UserTalent::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->patch(route('talents.update', $talent), [
            'occupation' => 'Chef',
            'confidence_level' => 'maestro',
            'experience_years' => 5,
        ])
        ->assertForbidden();
});

test('user can delete own talent', function () {
    $user = User::factory()->create();
    $talent = UserTalent::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('talents.destroy', $talent))
        ->assertRedirect();

    $this->assertDatabaseMissing('user_talents', ['id' => $talent->id]);
});

test('user cannot delete another users talent', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $talent = UserTalent::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->delete(route('talents.destroy', $talent))
        ->assertForbidden();
});

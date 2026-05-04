<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\Models\User;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('owner can create a milestone entry', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('proyectos.timeline.milestones.store', $project), [
            'title' => 'Lanzamos la primera versión',
        ])
        ->assertRedirect();

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::Milestone)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->user_id)->toBe($owner->id);
    expect($event->data['title'])->toBe('Lanzamos la primera versión');
});

test('milestone title is rejected when over 120 characters', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)
        ->from(route('proyectos.show', $project->post_id))
        ->post(route('proyectos.timeline.milestones.store', $project), [
            'title' => str_repeat('a', 121),
        ])
        ->assertSessionHasErrors('title');

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('milestone accepts exactly 120 characters', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('proyectos.timeline.milestones.store', $project), [
            'title' => str_repeat('a', 120),
        ])
        ->assertRedirect();

    expect(ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::Milestone)
        ->count())->toBe(1);
});

test('non-owner cannot create a milestone', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger)
        ->post(route('proyectos.timeline.milestones.store', $project), ['title' => 'Hola'])
        ->assertForbidden();

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('guest cannot create a milestone', function () {
    $project = Project::factory()->create();

    $this->post(route('proyectos.timeline.milestones.store', $project), ['title' => 'Hola'])
        ->assertRedirect(route('login'));

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('owner can create a status update entry', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('proyectos.timeline.status-updates.store', $project), [
            'body' => 'Estamos avanzando con el diseño esta semana.',
        ])
        ->assertRedirect();

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::StatusUpdate)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->user_id)->toBe($owner->id);
    expect($event->data['body'])->toBe('Estamos avanzando con el diseño esta semana.');
});

test('status update body is rejected when over 2000 characters', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner)
        ->from(route('proyectos.show', $project->post_id))
        ->post(route('proyectos.timeline.status-updates.store', $project), [
            'body' => str_repeat('a', 2001),
        ])
        ->assertSessionHasErrors('body');

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('non-owner cannot create a status update', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger)
        ->post(route('proyectos.timeline.status-updates.store', $project), ['body' => 'hi'])
        ->assertForbidden();

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('there is no patch or delete route for timeline entries', function () {
    expect(\Illuminate\Support\Facades\Route::has('proyectos.timeline.update'))->toBeFalse();
    expect(\Illuminate\Support\Facades\Route::has('proyectos.timeline.destroy'))->toBeFalse();
});

test('manual entries render with author on the show page', function () {
    $owner = User::factory()->create(['name' => 'Carolina Owner']);
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    ProjectTimelineEvent::factory()->milestone()->create([
        'project_id' => $project->id,
        'user_id' => $owner->id,
    ]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('timeline.entries.0.type', 'milestone')
            ->where('timeline.entries.0.actor.name', 'Carolina Owner')
        );
});

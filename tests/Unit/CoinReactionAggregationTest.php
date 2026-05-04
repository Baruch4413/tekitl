<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\Models\Reaction;
use App\Models\User;
use App\ProjectTimelineEventType;
use App\ReactionType;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class, Tests\TestCase::class);

beforeEach(function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-05-04 12:00:00'));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

test('first potenciar reaction inserts a coins_received row', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $reactor = User::factory()->create();

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactor->id,
        'type' => ReactionType::Potenciar,
    ]);

    $events = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::CoinsReceived)
        ->get();

    expect($events)->toHaveCount(1);
    expect($events->first()->data['coins'])->toBe(10);
});

test('second potenciar within 1 hour increments existing rows coins', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $reactorA = User::factory()->create();
    $reactorB = User::factory()->create();

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactorA->id,
        'type' => ReactionType::Potenciar,
    ]);

    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-05-04 12:30:00'));

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactorB->id,
        'type' => ReactionType::Potenciar,
    ]);

    $events = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::CoinsReceived)
        ->get();

    expect($events)->toHaveCount(1);
    expect($events->first()->data['coins'])->toBe(20);
});

test('reaction after 1 hour window opens a new coins_received row', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $reactorA = User::factory()->create();
    $reactorB = User::factory()->create();

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactorA->id,
        'type' => ReactionType::Potenciar,
    ]);

    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-05-04 13:30:00'));

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactorB->id,
        'type' => ReactionType::Potenciar,
    ]);

    $events = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::CoinsReceived)
        ->orderBy('created_at')
        ->get();

    expect($events)->toHaveCount(2);
    expect($events[0]->data['coins'])->toBe(10);
    expect($events[1]->data['coins'])->toBe(10);
});

test('non-potenciar reaction does not create coins_received event', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $reactor = User::factory()->create();

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactor->id,
        'type' => ReactionType::Like,
    ]);

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('potenciar on non-project post does not create timeline event', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    // No project for this post.
    $reactor = User::factory()->create();

    Reaction::query()->create([
        'post_id' => $post->id,
        'user_id' => $reactor->id,
        'type' => ReactionType::Potenciar,
    ]);

    expect(ProjectTimelineEvent::query()->count())->toBe(0);
});

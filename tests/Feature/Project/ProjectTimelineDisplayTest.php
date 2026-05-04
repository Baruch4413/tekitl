<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\Models\User;
use App\ProjectStage;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('timeline is visible to guest viewer with first 20 entries inline', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    ProjectTimelineEvent::factory()
        ->count(25)
        ->state(['project_id' => $project->id, 'user_id' => $owner->id])
        ->statusUpdate()
        ->create();

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('timeline.entries', 20)
            ->where('timeline.nextCursor', fn ($cursor) => $cursor !== null)
        );
});

test('timeline entries are returned in descending order by created_at', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    $oldest = ProjectTimelineEvent::factory()->statusUpdate()->create([
        'project_id' => $project->id,
        'user_id' => $owner->id,
        'created_at' => now()->subDays(3),
    ]);
    $middle = ProjectTimelineEvent::factory()->statusUpdate()->create([
        'project_id' => $project->id,
        'user_id' => $owner->id,
        'created_at' => now()->subDays(2),
    ]);
    $newest = ProjectTimelineEvent::factory()->statusUpdate()->create([
        'project_id' => $project->id,
        'user_id' => $owner->id,
        'created_at' => now()->subDay(),
    ]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('timeline.entries', 3)
            ->where('timeline.entries.0.id', $newest->id)
            ->where('timeline.entries.1.id', $middle->id)
            ->where('timeline.entries.2.id', $oldest->id)
        );
});

test('timeline returns empty array and null cursor when no entries exist', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('timeline.entries', [])
            ->where('timeline.nextCursor', null)
        );
});

test('timeline json endpoint returns older entries via cursor', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    foreach (range(1, 30) as $i) {
        ProjectTimelineEvent::factory()->statusUpdate()->create([
            'project_id' => $project->id,
            'user_id' => $owner->id,
            'created_at' => now()->subMinutes($i),
        ]);
    }

    $cursor = now()->subMinutes(20)->toIso8601String();

    $response = $this->getJson(route('proyectos.timeline.index', [
        'project' => $project,
        'cursor' => $cursor,
        'limit' => 5,
    ]));

    $response->assertOk();
    expect($response->json('entries'))->toHaveCount(5);
    expect($response->json('nextCursor'))->not->toBeNull();
});

test('timeline endpoint enforces default limit of 20 and max 50', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    foreach (range(1, 60) as $i) {
        ProjectTimelineEvent::factory()->statusUpdate()->create([
            'project_id' => $project->id,
            'user_id' => $owner->id,
            'created_at' => now()->subSeconds($i),
        ]);
    }

    $this->getJson(route('proyectos.timeline.index', $project))
        ->assertOk()
        ->assertJsonCount(20, 'entries');

    $this->getJson(route('proyectos.timeline.index', ['project' => $project, 'limit' => 999]))
        ->assertOk()
        ->assertJsonCount(50, 'entries');
});

test('timeline entries expose actor name and avatar', function () {
    $owner = User::factory()->create(['name' => 'Alice Owner']);
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    ProjectTimelineEvent::factory()->statusUpdate()->create([
        'project_id' => $project->id,
        'user_id' => $owner->id,
    ]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('timeline.entries.0.actor.name', 'Alice Owner')
        );
});

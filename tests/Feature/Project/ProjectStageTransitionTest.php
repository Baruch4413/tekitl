<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectTimelineEvent;
use App\Models\User;
use App\ProjectStage;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('show page exposes stage props for guest viewer', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('project.stage', 'planning')
            ->where('project.stageLabel', 'Planificación')
            ->where('project.allowedTransitions', [])
        );
});

test('owner of planning project sees legal next transitions', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('project.allowedTransitions', 2)
            ->where('project.allowedTransitions.0.to', 'in_execution')
            ->where('project.allowedTransitions.0.isTerminal', false)
            ->where('project.allowedTransitions.1.to', 'aborted')
            ->where('project.allowedTransitions.1.isTerminal', true)
        );
});

test('owner of completed project sees no allowed transitions', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
        'stage' => ProjectStage::Completed,
    ]);

    $this->actingAs($owner)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('project.stage', 'completed')
            ->where('project.allowedTransitions', [])
        );
});

test('owner can transition planning to in_execution', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'in_execution'])
        ->assertRedirect();

    expect($project->fresh()->stage)->toBe(ProjectStage::InExecution);
});

test('stage transition records a timeline event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'in_execution']);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::StageTransition)
        ->latest('created_at')
        ->first();

    expect($event)->not->toBeNull();
    expect($event->user_id)->toBe($owner->id);
    expect($event->data)->toMatchArray([
        'from' => 'planning',
        'to' => 'in_execution',
    ]);
});

test('illegal stage transition is rejected with 422', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->from(route('proyectos.show', $project->post_id))
        ->post(route('proyectos.stage.store', $project), ['to' => 'completed'])
        ->assertSessionHasErrors('to');

    expect($project->fresh()->stage)->toBe(ProjectStage::Planning);
});

test('terminal stage transition persists', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::InExecution,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'completed'])
        ->assertRedirect();

    expect($project->fresh()->stage)->toBe(ProjectStage::Completed);
});

test('stage cannot transition out of terminal state', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Completed,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'planning'])
        ->assertSessionHasErrors('to');

    expect($project->fresh()->stage)->toBe(ProjectStage::Completed);
});

test('unknown target stage is rejected', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $this->actingAs($owner)
        ->post(route('proyectos.stage.store', $project), ['to' => 'gibberish'])
        ->assertSessionHasErrors('to');
});

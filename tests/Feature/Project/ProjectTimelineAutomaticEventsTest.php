<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\ProjectRole;
use App\Models\ProjectTimelineEvent;
use App\Models\ProjectVolunteer;
use App\Models\User;
use App\ProjectStage;
use App\ProjectTimelineEventType;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('creating a project role records a role_created timeline event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create([
        'user_id' => $owner->id,
        'stage' => ProjectStage::Planning,
    ]);

    $role = ProjectRole::factory()->create([
        'project_id' => $project->id,
        'title' => 'Diseñador gráfico',
    ]);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::RoleCreated)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data)->toMatchArray([
        'role_id' => $role->id,
        'role_title' => 'Diseñador gráfico',
    ]);
});

test('volunteer transition pending to active records volunteer_joined event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $applicant = User::factory()->create();
    $volunteer = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'user_id' => $applicant->id,
        'status' => 'pending',
    ]);

    // Clear any role_created event so we only inspect transitions.
    ProjectTimelineEvent::query()->delete();

    $volunteer->update(['status' => 'active', 'joined_at' => now()]);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::VolunteerJoined)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data)->toMatchArray([
        'role_id' => $role->id,
        'volunteer_id' => $volunteer->id,
        'volunteer_user_id' => $applicant->id,
    ]);
});

test('volunteer transition active to bailed records volunteer_bailed owner_removed event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->active()->create(['project_role_id' => $role->id]);

    ProjectTimelineEvent::query()->delete();

    $volunteer->update(['status' => 'bailed']);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::VolunteerBailed)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data)->toMatchArray([
        'volunteer_id' => $volunteer->id,
        'reason' => 'owner_removed',
    ]);
});

test('volunteer transition active to exhausted records volunteer_exhausted event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->active()->create(['project_role_id' => $role->id]);

    ProjectTimelineEvent::query()->delete();

    $volunteer->update(['status' => 'exhausted']);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::VolunteerExhausted)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data['volunteer_id'])->toBe($volunteer->id);
});

test('uploading a project image records a photo_uploaded event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    $image = ProjectImage::factory()->create([
        'project_id' => $project->id,
        'path' => 'projects/example',
    ]);

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::PhotoUploaded)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data)->toMatchArray(['image_id' => $image->id]);
});

test('pending volunteer self-cancel via delete does not produce a timeline event', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);
    $role = ProjectRole::factory()->create(['project_id' => $project->id]);
    $volunteer = ProjectVolunteer::factory()->create([
        'project_role_id' => $role->id,
        'status' => 'pending',
    ]);

    ProjectTimelineEvent::query()->delete();

    $volunteer->delete();

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('project title or description edits do not produce timeline events', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['user_id' => $owner->id]);

    ProjectTimelineEvent::query()->delete();

    $project->update([
        'title' => 'New title',
        'description' => 'New description',
    ]);

    expect(ProjectTimelineEvent::query()->where('project_id', $project->id)->count())->toBe(0);
});

test('first potenciar reaction creates coins_received row', function () {
    $owner = User::factory()->create();
    $reactor = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create([
        'post_id' => $post->id,
        'user_id' => $owner->id,
    ]);

    $this->actingAs($reactor)
        ->post(route('posts.endorse', $post))
        ->assertRedirect();

    $event = ProjectTimelineEvent::query()
        ->where('project_id', $project->id)
        ->where('type', ProjectTimelineEventType::CoinsReceived)
        ->first();

    expect($event)->not->toBeNull();
    expect($event->data['coins'])->toBe(10);
});

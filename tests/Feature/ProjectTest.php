<?php

use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\User;
use App\ProjectImageSize;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('proyecto page renders for owner with existing project', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
            ->has('project')
            ->has('post')
            ->where('isOwner', true)
        );
});

test('visiting proyecto page creates project if none exists', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
        );

    expect(Project::where('post_id', $post->id)->exists())->toBeTrue();

    $project = Project::where('post_id', $post->id)->first();
    expect($project->user_id)->toBe($user->id);
    expect($project->goal)->toBe(100);
    expect($project->title)->toBe($post->body);
});

test('auto-generated project title is truncated with ellipsis for long posts', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create([
        'user_id' => $user->id,
        'body' => str_repeat('a', 500),
    ]);

    $this->actingAs($user)
        ->get(route('proyectos.show', $post))
        ->assertOk();

    $project = Project::where('post_id', $post->id)->first();
    expect($project->title)->toHaveLength(255);
    expect($project->title)->toEndWith('...');
    expect($project->title)->toStartWith(str_repeat('a', 252));
});

test('non-owner cannot create project by visiting page', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($other)
        ->get(route('proyectos.show', $post))
        ->assertNotFound();
});

test('non-owner can view existing project', function () {
    $owner = User::factory()->create();
    $visitor = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($visitor)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
            ->where('isOwner', false)
        );
});

test('visiting same post twice does not create duplicate project', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->get(route('proyectos.show', $post));
    $this->actingAs($user)->get(route('proyectos.show', $post));

    expect(Project::where('post_id', $post->id)->count())->toBe(1);
});

test('owner can update project fields', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('proyectos.update', $project), [
            'title' => 'Mi proyecto',
            'description' => 'Una descripción del proyecto',
            'goal' => 500,
        ])
        ->assertRedirect();

    $project->refresh();
    expect($project->title)->toBe('Mi proyecto');
    expect($project->description)->toBe('Una descripción del proyecto');
    expect($project->goal)->toBe(500);
});

test('non-owner cannot update project', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other)
        ->patch(route('proyectos.update', $project), [
            'title' => 'Hacked',
            'description' => 'Hacked',
            'goal' => 1,
        ])
        ->assertForbidden();
});

test('owner can upload image', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('proyectos.images.upload', $project), [
            'image' => UploadedFile::fake()->image('photo.jpg', 1200, 800),
        ])
        ->assertRedirect();

    expect($project->images()->count())->toBe(1);

    $image = $project->images()->first();
    foreach (ProjectImageSize::cases() as $size) {
        Storage::disk('s3')->assertExists("{$image->path}-{$size->value}.webp");
    }
});

test('non-owner cannot upload image', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->actingAs($other)
        ->post(route('proyectos.images.upload', $project), [
            'image' => UploadedFile::fake()->image('photo.jpg'),
        ])
        ->assertForbidden();
});

test('owner can delete image', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('proyectos.images.upload', $project), [
            'image' => UploadedFile::fake()->image('photo.jpg', 1200, 800),
        ]);

    $image = $project->images()->first();

    $this->actingAs($user)
        ->delete(route('proyectos.images.delete', [$project, $image]))
        ->assertRedirect();

    expect(ProjectImage::find($image->id))->toBeNull();

    foreach (ProjectImageSize::cases() as $size) {
        Storage::disk('s3')->assertMissing("{$image->path}-{$size->value}.webp");
    }
});

test('non-owner cannot delete image', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $image = ProjectImage::factory()->create(['project_id' => $project->id]);

    $this->actingAs($other)
        ->delete(route('proyectos.images.delete', [$project, $image]))
        ->assertForbidden();
});

test('show page includes coins and goal in project data', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id, 'coins' => 250]);
    Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id, 'goal' => 1000]);

    $this->actingAs($user)
        ->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
            ->where('project.goal', 1000)
            ->where('post.coins', 250)
        );
});

test('feed posts include project data', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('posts.data', 1, fn ($postPage) => $postPage
                ->where('hasProject', true)
                ->where('isOwner', true)
                ->etc()
            )
        );
});

test('owner can update image title and description', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);
    $image = ProjectImage::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->patch(route('proyectos.images.update', [$project, $image]), [
            'title' => 'Mi imagen',
            'description' => 'Una descripción',
        ])
        ->assertRedirect();

    $image->refresh();
    expect($image->title)->toBe('Mi imagen');
    expect($image->description)->toBe('Una descripción');
});

test('non-owner cannot update image metadata', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);
    $image = ProjectImage::factory()->create(['project_id' => $project->id]);

    $this->actingAs($other)
        ->patch(route('proyectos.images.update', [$project, $image]), [
            'title' => 'Hacked',
        ])
        ->assertForbidden();
});

test('authenticated users can comment on a project', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $post->user_id]);

    $this->actingAs($user)
        ->post(route('proyectos.comments.store', $project), ['body' => 'Great project!'])
        ->assertRedirect();

    expect($project->comments()->where('user_id', $user->id)->where('body', 'Great project!')->exists())->toBeTrue();
});

test('guests cannot comment on a project', function () {
    $post = Post::factory()->create();
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $post->user_id]);

    $this->post(route('proyectos.comments.store', $project), ['body' => 'Great project!'])
        ->assertRedirect(route('login'));
});

test('project comments endpoint returns formatted comments', function () {
    $post = Post::factory()->create();
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $post->user_id]);
    $project->comments()->create(['user_id' => $post->user_id, 'body' => 'A project comment']);

    $this->getJson(route('proyectos.comments.index', $project))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonStructure([['id', 'user', 'body', 'date', 'dateTime']]);
});

test('project comments are separate from post comments', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);
    $project = Project::factory()->create(['post_id' => $post->id, 'user_id' => $user->id]);

    $post->comments()->create(['user_id' => $user->id, 'body' => 'Post comment']);
    $project->comments()->create(['user_id' => $user->id, 'body' => 'Project comment']);

    expect($post->comments)->toHaveCount(1);
    expect($project->comments)->toHaveCount(1);
    expect($post->comments->first()->body)->toBe('Post comment');
    expect($project->comments->first()->body)->toBe('Project comment');
});

test('guests can view existing project page', function () {
    $owner = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create(['post_id' => $post->id, 'user_id' => $owner->id]);

    $this->get(route('proyectos.show', $post))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('proyectos/show')
            ->where('isOwner', false)
        );
});

test('guests get 404 for post without project', function () {
    $post = Post::factory()->create();

    $this->get(route('proyectos.show', $post))
        ->assertNotFound();
});

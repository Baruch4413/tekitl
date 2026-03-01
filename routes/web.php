<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserProfileInfoController;
use App\Http\Controllers\UserTalentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PostController::class, 'index'])->name('home');

Route::post('/posts', [PostController::class, 'store'])->middleware('auth')->name('posts.store');

Route::get('/posts/{post}/comments', [CommentController::class, 'index'])->name('comments.index');
Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->middleware('auth')->name('comments.store');

Route::post('/posts/{post}/potenciar', [PostController::class, 'potenciar'])->middleware('auth')->name('posts.potenciar');

Route::post('/posts/{post}/like', [PostController::class, 'toggleLike'])->middleware('auth')->name('posts.like');

Route::get('/users/{user}', [UserProfileController::class, 'show'])->name('users.show');
Route::post('/users/cover-photo', [UserProfileController::class, 'uploadCoverPhoto'])->middleware('auth')->name('users.cover-photo.upload');
Route::patch('/users/cover-photo/position', [UserProfileController::class, 'updateCoverPhotoPosition'])->middleware('auth')->name('users.cover-photo.position');

Route::post('/users/talents', [UserTalentController::class, 'store'])->middleware('auth')->name('talents.store');
Route::patch('/users/talents/{talent}', [UserTalentController::class, 'update'])->middleware('auth')->name('talents.update');
Route::delete('/users/talents/{talent}', [UserTalentController::class, 'destroy'])->middleware('auth')->name('talents.destroy');
Route::patch('/users/profile-info', [UserProfileInfoController::class, 'update'])->middleware('auth')->name('users.profile-info.update');

Route::get('/configuracion', function () {
    return Inertia\Inertia::render('configuracion');
})->middleware('auth')->name('configuracion');

Route::get('dashboard', function () {
    return Inertia\Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/auth/google/redirect', [SocialiteController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [SocialiteController::class, 'callback'])->name('auth.google.callback');

require __DIR__.'/settings.php';

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class SocialiteController extends Controller
{
    public function redirect(): SymfonyRedirectResponse|RedirectResponse
    {
        if (request()->boolean('popup')) {
            session()->put('auth_popup', true);
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse|\Illuminate\Http\Response
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::query()
            ->where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            $user->update(['google_id' => $googleUser->getId()]);
        } else {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user, remember: true);

        if (session()->pull('auth_popup')) {
            return response()->view('auth.popup-callback');
        }

        return redirect()->intended(route('dashboard'));
    }
}

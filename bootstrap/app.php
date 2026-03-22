<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if ($request->header('X-Inertia') && in_array($response->getStatusCode(), [500, 503, 403, 413])) {
                $message = match ($response->getStatusCode()) {
                    413 => 'El archivo es demasiado grande.',
                    403 => 'No tienes permiso para realizar esta acción.',
                    503 => 'El servicio no está disponible, intenta más tarde.',
                    default => 'Ocurrió un error inesperado, intenta de nuevo.',
                };

                return back()->with('error', $message);
            }

            if ($response->getStatusCode() === 419) {
                return back()->with('error', 'La página expiró, intenta de nuevo.');
            }

            return $response;
        });
    })->create();

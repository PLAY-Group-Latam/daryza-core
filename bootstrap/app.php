<?php

use App\Http\Web\Middleware\HandleAppearance;
use App\Http\Web\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        api: __DIR__ . '/../routes/api/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        // middleware api
        // $middleware->api(append: [
        //     // \App\Http\Api\v1\Middleware\ForceJsonResponse::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // 1️⃣ Errores de validación
        $exceptions->renderable(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => $e->errors(),
                ], 422); // siempre entero, OK
            }
        });

        // 2️⃣ Otros errores generales
        $exceptions->renderable(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                // Asegurar código de status HTTP válido
                $status = (int) $e->getCode();
                if ($status < 100 || $status >= 600) {
                    $status = 500; // fallback
                }

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Error interno del servidor',
                ], $status);
            }
        });
    })->create();

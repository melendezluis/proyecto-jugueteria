<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

// ====================== API PARA LA JUGUETERÍA ======================

// Rutas de prueba
Route::get('/test', function () {
    return ['mensaje' => 'API funcionando correctamente'];
});

// Autenticación (pública)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas públicas (solo lectura)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/slug/{slug}', [ProductController::class, 'bySlug']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Rutas protegidas (requieren token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Perfil
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Órdenes (cualquier cliente autenticado)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Productos (solo con permisos)
    Route::middleware('can:product-create')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
    });
    Route::middleware('can:product-edit')->group(function () {
        Route::put('/products/{id}', [ProductController::class, 'update']);
    });
    Route::middleware('can:product-delete')->group(function () {
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });

    // Categorías (solo con permisos)
    Route::middleware('can:category-create')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
    });
    Route::middleware('can:category-edit')->group(function () {
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
    });
    Route::middleware('can:category-delete')->group(function () {
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });

    // Marcas (solo con permisos)
    Route::middleware('can:brand-create')->group(function () {
        Route::post('/brands', [BrandController::class, 'store']);
    });
    Route::middleware('can:brand-edit')->group(function () {
        Route::put('/brands/{id}', [BrandController::class, 'update']);
    });
    Route::middleware('can:brand-delete')->group(function () {
        Route::delete('/brands/{id}', [BrandController::class, 'destroy']);
    });
});
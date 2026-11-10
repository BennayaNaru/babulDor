<?php

use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MyProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/categories', [ProductController::class, 'categories']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // belanja di kantin: semua peran (siswa, guru, pengurus, pembina)
    Route::middleware('role:user,admin_pengurus,admin_pembina')->group(function () {
        Route::get('/pickup-points', [OrderController::class, 'pickupPoints']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::patch('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // menitipkan dagangan: hanya siswa/guru (peran user)
    Route::middleware('role:user')->group(function () {
        Route::get('/my-products', [MyProductController::class, 'index']);
        Route::post('/my-products', [MyProductController::class, 'store']);
        Route::post('/my-products/{id}', [MyProductController::class, 'update']);
    });

    // admin pengurus + pembina (pembina hanya membaca)
    Route::middleware('role:admin_pengurus,admin_pembina')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/sales/daily', [SalesController::class, 'daily']);
        Route::get('/sales/export', [SalesController::class, 'export']);
        Route::get('/products', [AdminProductController::class, 'index']);
    });

    // admin pengurus saja
    Route::middleware('role:admin_pengurus')->prefix('admin')->group(function () {
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/submissions', [SubmissionController::class, 'index']);
        Route::post('/submissions/{id}/review', [SubmissionController::class, 'review']);

        Route::post('/stock-adjustments', [SalesController::class, 'adjust']);

        Route::patch('/products/{id}/status', [AdminProductController::class, 'setStatus']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
    });
});
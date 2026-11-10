<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ProfitNoteController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware(['auth', 'auto.logout'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/items', [ItemController::class, 'store']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    Route::post('/sales', [SaleController::class, 'store']);
    Route::delete('/sales/{id}', [SaleController::class, 'destroy']);

    Route::post('/profit-notes', [ProfitNoteController::class, 'store']);
    Route::delete('/profit-notes/{id}', [ProfitNoteController::class, 'destroy']);
});

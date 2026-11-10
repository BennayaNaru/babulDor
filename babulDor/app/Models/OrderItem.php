<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    public $timestamps = false;   // ← baris baru: tabel order_items tidak punya created_at/updated_at

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'supplier_price_snapshot',
        'display_price_snapshot',
        'profit_snapshot',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
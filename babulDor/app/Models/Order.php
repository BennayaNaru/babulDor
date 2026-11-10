<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const PICKUP_POINTS = [
        'Ruangan PKK',
    ];

    protected $fillable = [
        'buyer_id',
        'status',
        'total_price',
        'pickup_point',
        'pickup_code',
        'completed_at',
    ];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Pembatalan: kembalikan stok semua item lalu ubah status (panggil di dalam DB::transaction)
    public function restoreStockAndCancel(): void
    {
        foreach ($this->items as $item) {
            Product::withTrashed()->whereKey($item->product_id)->increment('stock', $item->quantity);
        }
        $this->update(['status' => 'dibatalkan']);
    }

    public function toApi(): array
    {
        $this->loadMissing('items.product');

        return [
            'id'           => $this->id,
            'number'       => 'PKK-' . str_pad($this->id, 4, '0', STR_PAD_LEFT),
            'status'       => $this->status,
            'pickup_point' => $this->pickup_point,
            'pickup_code'  => $this->pickup_code,
            'total'        => $this->total_price,
            'created_at'   => $this->created_at->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'buyer'        => $this->relationLoaded('buyer') && $this->buyer
                ? ['name' => $this->buyer->name, 'class' => $this->buyer->class_or_position]
                : null,
            'items'        => $this->items->map(fn($i) => [
                'name'     => $i->product?->name,
                'quantity' => $i->quantity,
                'price'    => $i->display_price_snapshot,
            ])->values(),
        ];
    }
}

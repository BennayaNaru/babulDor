<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    // Untuk pemasok dan pengurus (berisi harga pemasok, status, alasan penolakan)
    public function toManageApi(): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'category'         => $this->category
                ? ['id' => $this->category->id, 'name' => $this->category->name]
                : null,
            'supplier'         => $this->relationLoaded('supplier') && $this->supplier
                ? ['name' => $this->supplier->name, 'class' => $this->supplier->class_or_position]
                : null,
            'supplier_price'   => $this->supplier_price,
            'display_price'    => $this->display_price,
            'stock'            => $this->stock,
            'status'           => $this->status,
            'rejection_reason' => $this->rejection_reason,

            // ---> UBAH JADI SEPERTI INI (tambahkan asset()):
            'image_url'        => $this->image ? asset('storage/' . $this->image) : null,

            'created_at'       => $this->created_at->toIso8601String(),
        ];
    }

    public const PKK_PROFIT = 1000;

    protected $fillable = [
        'supplier_id',
        'category_id',
        'name',
        'description',
        'image',
        'supplier_price',
        'stock',
        'status',
        'rejection_reason',
    ];

    // BR-05: harga etalase selalu dihitung sistem = harga pemasok + Rp1.000
    protected static function booted(): void
    {
        static::saving(function (Product $p) {
            $p->display_price = $p->supplier_price + self::PKK_PROFIT;
        });
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'disetujui');
    }

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}

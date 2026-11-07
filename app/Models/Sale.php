<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = ['item_id', 'qty_terjual', 'total_harga_jual', 'tanggal'];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}

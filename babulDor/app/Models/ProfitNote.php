<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfitNote extends Model
{
    protected $fillable = ['nama_barang', 'jam_jual', 'qty', 'laba_per_pcs', 'tanggal'];
}

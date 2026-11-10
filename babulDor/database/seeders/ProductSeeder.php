<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cat = DB::table('categories')->pluck('id', 'name');
        $admin = User::where('role', 'admin_pengurus')->first();

        $mk = fn (string $id, string $name, string $kelas) => User::create([
            'identifier' => $id, 'name' => $name, 'user_type' => 'siswa',
            'class_or_position' => $kelas, 'role' => 'user',
        ]);

        $kuliner    = $mk('0000000101', 'Pemasok Kuliner', 'XI Kuliner 2');
        $tataBoga   = $mk('0000000102', 'Pemasok Tata Boga', 'XII Tata Boga 1');
        $agribisnis = $mk('0000000103', 'Pemasok Agribisnis', 'XI Agribisnis');
        $kriya      = $mk('0000000104', 'Pemasok Kriya', 'XI DKV & Kriya');

        // [pemasok, kategori, nama, harga pemasok, stok, deskripsi]
        $items = [
            [$kuliner, 'Snack & Jajanan', 'Risol Mayo Lumer Smoked Beef', 3000, 24,
                'Kulit risol lembut renyah di luar, isian telur rebus, mayones gurih racikan siswa, dan irisan smoked beef berkualitas.'],
            [$tataBoga, 'Makanan Berat', 'Dimsum Ayam Keju Kukus (Isi 4)', 12000, 15,
                'Dibuat dari 100% daging paha ayam segar tanpa boraks, lelehan keju cheddar di bagian atas, disajikan lengkap dengan chili oil khas PKK.'],
            [$kuliner, 'Minuman Segar', 'Es Teh Melati Jumbo Kampus', 3000, 45,
                'Seduhan teh melati alami dengan gula tebu asli. Dingin, menyegarkan setelah jam olahraga, ukuran 22oz anti tumpah.'],
            [$tataBoga, 'Snack & Jajanan', 'Brownies Kukus Mini Chocochip', 5000, 18,
                'Tekstur fudgy lembut dengan taburan butiran chocochip melimpah. Manisnya pas, cocok menemani waktu istirahat sekolah.'],
            [$kuliner, 'Makanan Berat', 'Nasi Bakar Cumi Pedas Kemangi', 10000, 12,
                'Nasi gurih dibungkus daun pisang lalu dibakar harum. Isian cumi asin tumis cabai rawit dan daun kemangi segar wangi aromatik.'],
            [$agribisnis, 'Snack & Jajanan', 'Keripik Pisang Coklat Lumer', 7000, 22,
                'Pisang kepok pilihan renyah dibalut coklat leleh khas Lampung. Kemasan ziplock higienis, tahan renyah hingga 1 minggu.'],
            [$kriya, 'Kerajinan Kreatif', 'Totebag Kanvas Sablon PKK 2025', 25000, 8,
                'Bahan kanvas tebal dengan sablon rubber tahan cuci bertema SMK Unggul Kreatif. Muat laptop 14 inch dan buku pelajaran tebal.'],
            [$tataBoga, 'Minuman Segar', 'Kopi Susu Gula Aren Botol (250ml)', 9000, 0,
                'Biji kopi robusta lokal di-brew segar dicampur susu evaporasi gurih dan gula aren murni tanpa sirup sintetis.'],
        ];

        foreach ($items as [$supplier, $category, $name, $price, $stock, $desc]) {
            $product = Product::create([
                'supplier_id'    => $supplier->id,
                'category_id'    => $cat[$category],
                'name'           => $name,
                'description'    => $desc,
                'supplier_price' => $price,
                'stock'          => $stock,
                'status'         => 'disetujui',
            ]);

            // FR-REV-04: saat disetujui, tercatat barang masuk sebesar stok awal
            if ($stock > 0) {
                DB::table('stock_movements')->insert([
                    'product_id' => $product->id, 'type' => 'masuk', 'quantity' => $stock,
                    'note' => 'Stok awal (seeder)', 'created_by' => $admin->id,
                    'movement_date' => today(), 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminProductController extends Controller
{
    // Produk yang sudah tayang (atau dinonaktifkan). Pengajuan baru ada di halaman Verifikasi.
    private const MANAGED = ['disetujui', 'nonaktif'];

    public function index(Request $request)
    {
        $query = Product::with(['category:id,name', 'supplier:id,name,class_or_position'])
            ->whereIn('status', self::MANAGED);

        if ($search = trim($request->query('q', ''))) {
            $query->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                  ->orWhereHas('supplier', fn ($s) => $s->where('name', 'like', "%{$search}%"));
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if (in_array($request->query('status'), self::MANAGED, true)) {
            $query->where('status', $request->query('status'));
        }

        $page = $query->latest('id')->paginate(10);

        return response()->json([
            'data' => collect($page->items())->map(fn ($p) => $p->toManageApi())->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page'    => $page->lastPage(),
                'total'        => $page->total(),
                'from'         => $page->firstItem(),
                'to'           => $page->lastItem(),
            ],
        ]);
    }

    // Saklar tayang / nonaktif
    public function setStatus(Request $request, int $id)
    {
        $data = $request->validate(['status' => ['required', Rule::in(self::MANAGED)]]);

        $product = Product::whereIn('status', self::MANAGED)->findOrFail($id);
        $product->update(['status' => $data['status']]);

        $this->log($request->user()->id, $data['status'] === 'nonaktif' ? 'product.deactivate' : 'product.activate', $product->id);

        return response()->json([
            'message' => $data['status'] === 'nonaktif' ? 'Produk disembunyikan dari katalog.' : 'Produk kembali tayang.',
        ]);
    }

    // Hapus (soft delete) — misalnya pemasok sudah tidak memasok lagi
    public function destroy(Request $request, int $id)
    {
        $admin = $request->user();

        DB::transaction(function () use ($id, $admin) {
            $product = Product::whereIn('status', self::MANAGED)->lockForUpdate()->findOrFail($id);

            // jangan hapus selama masih ada di pesanan yang belum selesai
            $activeOrders = OrderItem::where('product_id', $product->id)
                ->whereHas('order', fn ($o) => $o->whereIn('status', ['dipesan', 'siap_diambil']))
                ->distinct()
                ->count('order_id');

            if ($activeOrders > 0) {
                throw ValidationException::withMessages([
                    'product' => "Produk masih ada di {$activeOrders} pesanan aktif. Selesaikan atau batalkan pesanan itu terlebih dahulu.",
                ]);
            }

            // sisa stok ditarik dan dicatat agar rekap harian tetap seimbang
            if ($product->stock > 0) {
                DB::table('stock_movements')->insert([
                    'product_id'    => $product->id,
                    'type'          => 'penyesuaian',
                    'quantity'      => -$product->stock,
                    'note'          => 'Produk dihapus dari katalog: sisa stok ditarik',
                    'created_by'    => $admin->id,
                    'movement_date' => today(),
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }

            $product->update(['stock' => 0]);
            $product->delete();   // soft delete

            $this->log($admin->id, 'product.delete', $product->id);
        });

        return response()->json(['message' => 'Produk dihapus dari katalog.']);
    }

    private function log(int $userId, string $action, int $productId): void
    {
        DB::table('activity_logs')->insert([
            'user_id'     => $userId,
            'action'      => $action,
            'target_type' => 'product',
            'target_id'   => $productId,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }
}
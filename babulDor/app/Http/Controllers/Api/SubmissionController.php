<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SubmissionController extends Controller
{
    public function index()
    {
        $items = Product::with(['category:id,name', 'supplier:id,name,class_or_position'])
            ->where('status', 'menunggu')
            ->oldest('id')
            ->get();

        return response()->json(['data' => $items->map(fn ($p) => $p->toManageApi())]);
    }

    public function review(Request $request, int $id)
    {
        $data = $request->validate([
            'is_clean'        => ['required', 'boolean'],
            'is_packaging_ok' => ['required', 'boolean'],
            'is_fresh'        => ['required', 'boolean'],
            'is_consumable'   => ['required', 'boolean'],
            'result'          => ['required', Rule::in(['acc', 'tolak'])],
            'notes'           => ['nullable', 'string', 'max:500'],
        ]);

        $allPassed = $data['is_clean'] && $data['is_packaging_ok'] && $data['is_fresh'] && $data['is_consumable'];

        if ($data['result'] === 'acc' && ! $allPassed) {
            throw ValidationException::withMessages([
                'result' => 'ACC hanya bisa jika semua poin pemeriksaan lolos. Jika ada yang tidak lolos, pilih Tolak.',
            ]);
        }

        // BR-04: penolakan wajib disertai alasan
        if ($data['result'] === 'tolak' && blank($data['notes'] ?? null)) {
            throw ValidationException::withMessages(['notes' => 'Alasan penolakan wajib diisi.']);
        }

        $admin = $request->user();

        DB::transaction(function () use ($id, $data, $admin) {
            $product = Product::lockForUpdate()->findOrFail($id);

            if ($product->status !== 'menunggu') {
                throw ValidationException::withMessages(['status' => 'Pengajuan ini sudah diperiksa.']);
            }

            // FR-REV-05: jejak pemeriksaan
            DB::table('product_reviews')->insert([
                'product_id'      => $product->id,
                'reviewer_id'     => $admin->id,
                'is_clean'        => $data['is_clean'],
                'is_packaging_ok' => $data['is_packaging_ok'],
                'is_fresh'        => $data['is_fresh'],
                'is_consumable'   => $data['is_consumable'],
                'result'          => $data['result'],
                'notes'           => $data['notes'] ?? null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            if ($data['result'] === 'acc') {
                $product->update(['status' => 'disetujui', 'rejection_reason' => null]);

                // FR-REV-04: catat barang masuk sebesar stok awal
                DB::table('stock_movements')->insert([
                    'product_id'    => $product->id,
                    'type'          => 'masuk',
                    'quantity'      => $product->stock,
                    'note'          => 'Barang masuk: pengajuan disetujui',
                    'created_by'    => $admin->id,
                    'movement_date' => today(),
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            } else {
                $product->update(['status' => 'ditolak', 'rejection_reason' => $data['notes']]);
            }

            DB::table('activity_logs')->insert([
                'user_id'     => $admin->id,
                'action'      => 'product.'.$data['result'],
                'target_type' => 'product',
                'target_id'   => $product->id,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        });

        return response()->json([
            'message' => $data['result'] === 'acc' ? 'Dagangan disetujui.' : 'Dagangan ditolak.',
        ]);
    }
}
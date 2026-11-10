<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\SalesReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesController extends Controller
{
    public function daily(Request $request, SalesReport $report)
    {
        [$from, $to, $supplierId] = $this->filters($request);

        return response()->json(['data' => $report->build($from, $to, $supplierId)]);
    }

    public function export(Request $request, SalesReport $report)
    {
        [$from, $to, $supplierId] = $this->filters($request);
        $data = $report->build($from, $to, $supplierId);

        $out = fopen('php://temp', 'r+');
        fwrite($out, "\xEF\xBB\xBF");   // BOM agar Excel membaca UTF-8
        fputcsv($out, ['Periode', $from === $to ? $from : "{$from} s/d {$to}"]);
        fputcsv($out, []);
        fputcsv($out, [
            'Produk', 'Pemasok', 'Kelas', 'Masuk', 'Keluar (Terjual)', 'Penyesuaian', 'Sisa',
            'Harga Pemasok', 'Harga Etalase', 'Omzet', 'Hak Pemasok', 'Laba PKK',
        ]);

        foreach ($data['rows'] as $r) {
            fputcsv($out, [
                $this->safe($r['product']), $this->safe($r['supplier']), $this->safe($r['supplier_class']),
                $r['in'], $r['out'], $r['adjust'], $r['left'],
                $r['supplier_price'], $r['display_price'], $r['revenue'], $r['supplier_share'], $r['profit'],
            ]);
        }

        $s = $data['summary'];
        fputcsv($out, [
            'TOTAL', '', '', $s['units_in'], $s['units_sold'], '', $s['units_left'],
            '', '', $s['revenue'], $s['supplier_share'], $s['profit'],
        ]);

        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);

        $name = 'rekap-penjualan-'.$from.($from === $to ? '' : '_'.$to).'.csv';

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$name.'"',
        ]);
    }

    // FR-SAL-03: catatan manual (barang rusak, koreksi stok) dengan alasan
    public function adjust(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'not_in:0', 'between:-500,500'],
            'note'       => ['required', 'string', 'max:255'],
        ], [
            'note.required'   => 'Alasan penyesuaian wajib diisi.',
            'quantity.not_in' => 'Jumlah tidak boleh nol.',
        ]);

        $admin = $request->user();

        DB::transaction(function () use ($data, $admin) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $newStock = $product->stock + $data['quantity'];

            if ($newStock < 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok tidak boleh minus (stok saat ini {$product->stock}).",
                ]);
            }

            $product->update(['stock' => $newStock]);

            DB::table('stock_movements')->insert([
                'product_id'    => $product->id,
                'type'          => 'penyesuaian',
                'quantity'      => $data['quantity'],
                'note'          => $data['note'],
                'created_by'    => $admin->id,
                'movement_date' => today(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            DB::table('activity_logs')->insert([
                'user_id'     => $admin->id,
                'action'      => 'stock.adjust',
                'target_type' => 'product',
                'target_id'   => $product->id,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        });

        return response()->json(['message' => 'Penyesuaian stok dicatat.'], 201);
    }

    private function filters(Request $request): array
    {
        $data = $request->validate([
            'date'        => ['nullable', 'date_format:Y-m-d'],
            'to'          => ['nullable', 'date_format:Y-m-d'],
            'supplier_id' => ['nullable', 'integer'],
        ]);

        $from = $data['date'] ?? today()->toDateString();
        $to = $data['to'] ?? $from;

        if ($from > $to) {
            [$from, $to] = [$to, $from];
        }

        return [$from, $to, isset($data['supplier_id']) ? (int) $data['supplier_id'] : null];
    }

    // cegah CSV injection: sel teks yang diawali = + - @ dianggap rumus oleh Excel
    private function safe(?string $value): string
    {
        $value = (string) $value;

        return preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value;
    }
}
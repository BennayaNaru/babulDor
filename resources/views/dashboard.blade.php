@extends('layout')

@section('content')
<div class="container mx-auto p-4 md:p-6">

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 class="text-2xl font-bold">Dashboard PKK</h1>
            <p class="text-sm text-gray-600">
                Login sebagai <strong>{{ auth()->user()->name }}</strong>
                ({{ auth()->user()->kelas }}) |
                Sesi berakhir pukul 00:00
            </p>
        </div>
        <form method="POST" action="/logout">
            @csrf
            <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full md:w-auto">Logout</button>
        </form>
    </div>

    @if(session('success'))
        <div class="bg-green-100 text-green-800 p-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    @if($errors->any())
        <div class="bg-red-100 text-red-800 p-3 rounded mb-4">
            @foreach($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif

    @if($isTutupBuku)
        <div class="bg-yellow-100 text-yellow-800 p-4 rounded mb-4 font-bold border-l-4 border-yellow-500">
            Waktu sudah lewat jam 15:00. Data Barang Pemasok dan Laba hari ini telah ditutup. Silakan buka kembali besok.
        </div>
    @endif

    <div class="flex flex-col md:flex-row gap-2 mb-4">
        <button onclick="showTab(1)" id="btn-tab-1" class="tab-btn bg-gray-300 px-4 py-2 rounded w-full md:w-auto">Tab 1 - Barang Pemasok</button>
        <button onclick="showTab(2)" id="btn-tab-2" class="tab-btn bg-gray-300 px-4 py-2 rounded w-full md:w-auto">Tab 2 - Laba PKK</button>
        <button onclick="showTab(3)" id="btn-tab-3" class="tab-btn bg-gray-300 px-4 py-2 rounded w-full md:w-auto">Tab 3 - Histori & Penjualan</button>
    </div>

    <div id="tab-1" class="tab-content">
        <div class="bg-white p-4 md:p-6 rounded-lg shadow mb-4 overflow-x-auto">
            <h2 class="text-xl font-bold mb-4">Daftar Barang dari Pemasok (Harga Asli)</h2>

            @if(!$isTutupBuku)
            <form method="POST" action="/items" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                @csrf
                <input type="hidden" name="tab" value="1">
                <input type="text" name="nama_barang" placeholder="Nama Barang" class="border rounded px-3 py-2 w-full" required>
                <input type="number" name="harga_asli" placeholder="Harga Asli" class="border rounded px-3 py-2 w-full" required>
                <input type="number" name="stok_awal" placeholder="Stok" class="border rounded px-3 py-2 w-full" required>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Tambah</button>
            </form>
            @endif

            <div class="overflow-x-auto">
                <table class="w-full border-collapse min-w-max">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border p-2 text-left">Nama Barang</th>
                            <th class="border p-2 text-right">Harga Asli</th>
                            <th class="border p-2 text-right">Stok</th>
                            <th class="border p-2 text-right">Total</th>
                            <th class="border p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($items as $item)
                        <tr>
                            <td class="border p-2">{{ $item->nama_barang }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format($item->harga_asli) }}</td>
                            <td class="border p-2 text-right">{{ $item->stok_awal }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format($item->harga_asli * $item->stok_awal) }}</td>
                            <td class="border p-2 text-center">
                                <form method="POST" action="/items/{{ $item->id }}" onsubmit="return confirm('Hapus barang?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600">Hapus</button>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <tr><td colspan="5" class="text-center p-4 text-gray-500">Tidak ada data barang / sudah tutup buku.</td></tr>
                        @endforelse
                    </tbody>
                    <tfoot>
                        <tr class="bg-blue-100 font-bold">
                            <td class="border p-2" colspan="3">Total Keseluruhan</td>
                            <td class="border p-2 text-right">Rp {{ number_format($totalPemasok) }}</td>
                            <td class="border p-2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

    <div id="tab-2" class="tab-content hidden">
        <div class="bg-white p-4 md:p-6 rounded-lg shadow mb-4">
            <h2 class="text-xl font-bold mb-4">Harga Jual PKK & Catatan Laba</h2>

            <div class="mb-6 overflow-x-auto">
                <h3 class="font-semibold mb-2">Barang Belum Terjual (Estimasi Laba)</h3>
                <table class="w-full border-collapse min-w-max">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border p-2 text-left">Nama Barang</th>
                            <th class="border p-2 text-right">Harga Jual (Asli+1k)</th>
                            <th class="border p-2 text-right">Stok</th>
                            <th class="border p-2 text-right">Total Laba Potensial</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($items as $item)
                        @php $hargaJual = $item->harga_asli + 1000; @endphp
                        <tr>
                            <td class="border p-2">{{ $item->nama_barang }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format($hargaJual) }}</td>
                            <td class="border p-2 text-right">{{ $item->stok_awal }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format(1000 * $item->stok_awal) }}</td>
                        </tr>
                        @empty
                        <tr><td colspan="4" class="text-center p-4 text-gray-500">Tidak ada data barang.</td></tr>
                        @endforelse
                    </tbody>
                    <tfoot>
                        <tr class="bg-green-100 font-bold">
                            <td class="border p-2" colspan="3">Total Laba Potensial</td>
                            <td class="border p-2 text-right">Rp {{ number_format($totalLabaPotensial) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <hr class="my-6">

            <div>
                <h3 class="font-semibold mb-2">Catatan Laba (Barang Terjual)</h3>

                @if(!$isTutupBuku)
                <form method="POST" action="/profit-notes" class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
                    @csrf
                    <input type="hidden" name="tab" value="2">
                    <input type="text" name="nama_barang" placeholder="Nama Barang (cth: Ayam Suwir)" class="border rounded px-3 py-2 w-full" required>
                    <input type="text" name="jam_jual" placeholder="Jam (cth: 14:30)" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" title="Gunakan format 24 jam (HH:MM), contoh: 13:00" class="border rounded px-3 py-2 w-full" required>
                    <input type="number" name="qty" placeholder="Jumlah (Qty)" class="border rounded px-3 py-2 w-full" required>
                    <input type="number" name="laba_per_pcs" placeholder="Laba per pcs (cth: 10000)" class="border rounded px-3 py-2 w-full" required>
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Catat</button>
                </form>
                @endif

                <div class="overflow-x-auto">
                    <table class="w-full border-collapse min-w-max">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="border p-2 text-left">Jam</th>
                                <th class="border p-2 text-left">Nama Barang</th>
                                <th class="border p-2 text-right">Qty</th>
                                <th class="border p-2 text-right">Laba/pcs</th>
                                <th class="border p-2 text-right">Total Laba</th>
                                <th class="border p-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($profitNotes as $note)
                            <tr>
                                <td class="border p-2">{{ $note->jam_jual }}</td>
                                <td class="border p-2">{{ $note->nama_barang }}</td>
                                <td class="border p-2 text-right">{{ $note->qty }}</td>
                                <td class="border p-2 text-right">Rp {{ number_format($note->laba_per_pcs) }}</td>
                                <td class="border p-2 text-right">Rp {{ number_format($note->qty * $note->laba_per_pcs) }}</td>
                                <td class="border p-2 text-center">
                                    <form method="POST" action="/profit-notes/{{ $note->id }}" onsubmit="return confirm('Hapus catatan ini?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600">Hapus</button>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="6" class="text-center p-4 text-gray-500">Belum ada catatan laba terjual.</td></tr>
                            @endforelse
                        </tbody>
                        <tfoot>
                            <tr class="bg-green-100 font-bold">
                                <td class="border p-2" colspan="4">Total Laba Terjual (Catatan)</td>
                                <td class="border p-2 text-right">Rp {{ number_format($totalLabaManual) }}</td>
                                <td class="border p-2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div id="tab-3" class="tab-content hidden">
        <div class="bg-white p-4 md:p-6 rounded-lg shadow mb-4">
            <h2 class="text-xl font-bold mb-4">Histori Penjualan Hari Ini</h2>

            @if(!$isTutupBuku)
            <form method="POST" action="/sales" class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                @csrf
                <input type="hidden" name="tab" value="3">
                <select name="item_id" class="border rounded px-3 py-2 w-full" required>
                    <option value="">-- Pilih Barang --</option>
                    @foreach($items as $item)
                        <option value="{{ $item->id }}">
                            {{ $item->nama_barang }} (Stok: {{ $item->stok_awal }}, Rp {{ number_format($item->harga_asli + 1000) }})
                        </option>
                    @endforeach
                </select>
                <input type="number" name="qty_terjual" placeholder="Jumlah Terjual" class="border rounded px-3 py-2 w-full" required>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Catat Penjualan</button>
            </form>
            @endif

            <div class="overflow-x-auto">
                <table class="w-full border-collapse min-w-max">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="border p-2 text-left">Tanggal</th>
                            <th class="border p-2 text-left">Nama Barang</th>
                            <th class="border p-2 text-right">Qty</th>
                            <th class="border p-2 text-right">Total Harga (Asli)</th>
                            <th class="border p-2 text-right">Laba</th>
                            <th class="border p-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($penjualanHariIni as $jual)
                        <tr>
                            <td class="border p-2">{{ \Carbon\Carbon::parse($jual->tanggal)->format('d-m-Y') }}</td>
                            <td class="border p-2">{{ $jual->item->nama_barang }}</td>
                            <td class="border p-2 text-right">{{ $jual->qty_terjual }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format($jual->item->harga_asli * $jual->qty_terjual) }}</td>
                            <td class="border p-2 text-right">Rp {{ number_format($jual->total_harga_jual - ($jual->item->harga_asli * $jual->qty_terjual)) }}</td>
                            <td class="border p-2 text-center">
                                <form method="POST" action="/sales/{{ $jual->id }}" onsubmit="return confirm('Batalkan penjualan ini? Stok akan dikembalikan.')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600">Batalkan</button>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <tr><td colspan="6" class="text-center p-4 text-gray-500">Belum ada penjualan hari ini.</td></tr>
                        @endforelse
                    </tbody>
                    <tfoot>
                        <tr class="bg-green-200 font-bold text-lg">
                            <td class="border p-2" colspan="4">TOTAL LABA HARI INI (Sama dengan Tab 2)</td>
                            <td class="border p-2 text-right">Rp {{ number_format($totalLabaManual) }}</td>
                            <td class="border p-2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

</div>

<script>
    function showTab(num) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.getElementById('tab-' + num).classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('bg-blue-600', 'text-white');
            el.classList.add('bg-gray-300');
        });
        const active = document.getElementById('btn-tab-' + num);
        active.classList.remove('bg-gray-300');
        active.classList.add('bg-blue-600', 'text-white');
    }

    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        let activeTab = urlParams.get('tab');

        if (!activeTab) {
            activeTab = "{{ session('tab') ?? '1' }}";
        }

        showTab(activeTab);
    });
</script>
@endsection

import { useCallback, useEffect, useState } from 'react'
import api from '../../lib/api'
import Icon from '../../components/Icon'
import { useToast } from '../../context/ToastContext'
import { downloadFile } from '../../lib/download'
import { errorMessages } from '../../lib/errors'
import { formatDate, rupiah, todayString } from '../../lib/format'

const inputCls =
  'px-3 py-2 rounded-xl border border-surface-container-highest bg-surface-container-lowest text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none'

function AdjustModal({ onClose, onSaved }) {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ product_id: '', kind: 'rusak', qty: 1, note: '' })
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/products').then((res) => {
      setProducts(res.data.data)
      setForm((f) => ({ ...f, product_id: res.data.data[0]?.id ?? '' }))
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErrors([])
    const qty = Math.abs(parseInt(form.qty) || 0)
    try {
      await api.post('/admin/stock-adjustments', {
        product_id: form.product_id,
        quantity: form.kind === 'rusak' ? -qty : qty,
        note: form.note.trim(),
      })
      showToast('Penyesuaian stok dicatat.')
      onSaved()
    } catch (err) {
      setErrors(errorMessages(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-surface-container-highest shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Catat Penyesuaian Stok</h3>
          <button type="button" onClick={onClose} className="text-secondary hover:text-on-surface">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-label-md font-label-md text-on-surface">Produk</label>
          <select className={`${inputCls} w-full`} value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stok {p.stock})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Jenis</label>
            <select className={`${inputCls} w-full`} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="rusak">Rusak / hilang (−)</option>
              <option value="tambah">Koreksi tambah (+)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Jumlah (Pcs)</label>
            <input type="number" min="1" max="500" className={`${inputCls} w-full`} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-label-md font-label-md text-on-surface">Alasan <span className="text-error">*</span></label>
          <textarea rows={2} className={`${inputCls} w-full`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Contoh: Kemasan bocor saat diantar ke kantin" required />
        </div>

        {errors.length > 0 && (
          <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md space-y-1">
            {errors.map((m, i) => <p key={i}>{m}</p>)}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-surface-container-highest text-secondary hover:bg-surface-container-low font-label-md">Batal</button>
          <button type="submit" disabled={busy} className="flex-1 py-2 rounded-xl bg-primary text-white hover:bg-primary-container font-label-md shadow-sm disabled:opacity-60">
            {busy ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PenjualanPage({
  readOnly = false,
  title = 'Buku Kas & Pembukuan Harian PKK',
  subtitle = 'Perhitungan otomatis hak bagi hasil siswa dan akumulasi dana kas sekolah.',
}) {
  const [from, setFrom] = useState(todayString())
  const [to, setTo] = useState(todayString())
  const [supplierId, setSupplierId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdjust, setShowAdjust] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/sales/daily', { params: { date: from, to, supplier_id: supplierId || undefined } })
      .then((res) => {
        setData(res.data.data)
        setError('')
      })
      .catch(() => setError('Gagal memuat rekap penjualan.'))
      .finally(() => setLoading(false))
  }, [from, to, supplierId])

  useEffect(() => {
    load()
  }, [load])

  function changeFrom(v) {
    setFrom(v)
    if (v > to) setTo(v)
  }
  function changeTo(v) {
    setTo(v)
    if (v < from) setFrom(v)
  }

  async function exportCsv() {
    try {
      await downloadFile('/admin/sales/export', { date: from, to, supplier_id: supplierId || undefined },
        `rekap-penjualan-${from}${from === to ? '' : `_${to}`}.csv`)
    } catch {
      window.alert('Gagal mengunduh rekap.')
    }
  }

  const s = data?.summary
  const periodLabel = from === to ? formatDate(from) : `${formatDate(from)} s/d ${formatDate(to)}`

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
          <p className="text-body-sm font-body-sm text-secondary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={exportCsv} className="px-3.5 py-2 rounded-xl border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-label-md font-label-md flex items-center gap-1.5 shadow-sm">
            <Icon name="table_view" className="text-[18px]" /> Ekspor CSV
          </button>
          <button onClick={() => window.print()} className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-label-md font-label-md flex items-center gap-1.5 shadow-sm">
            <Icon name="print" className="text-[18px]" /> Cetak Pembukuan
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">Dari Tanggal</label>
          <input type="date" className={`${inputCls} block`} value={from} onChange={(e) => changeFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">Sampai Tanggal</label>
          <input type="date" className={`${inputCls} block`} value={to} onChange={(e) => changeTo(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-secondary uppercase">Pemasok</label>
          <select className={`${inputCls} block min-w-[200px]`} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Semua pemasok</option>
            {data?.suppliers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.class_or_position})</option>)}
          </select>
        </div>
        {!readOnly && (
          <button onClick={() => setShowAdjust(true)} className="ml-auto px-3.5 py-2 rounded-xl border border-primary text-primary hover:bg-primary-fixed/40 text-label-md font-label-md flex items-center gap-1.5">
            <Icon name="edit_note" className="text-[18px]" /> Catat Penyesuaian
          </button>
        )}
      </div>

      {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
          <span className="text-[11px] text-secondary uppercase font-semibold">Total Omzet Penjualan</span>
          <p className="text-headline-md font-headline-md text-on-surface mt-1">{rupiah(s?.revenue ?? 0)}</p>
          <span className="text-[11px] text-secondary">{s?.units_sold ?? 0} Pcs terjual pada periode ini</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
          <span className="text-[11px] text-secondary uppercase font-semibold">Hak Pemasok Siswa (Bersih)</span>
          <p className="text-headline-md font-headline-md text-blue-700 mt-1">{rupiah(s?.supplier_share ?? 0)}</p>
          <span className="text-[11px] text-secondary">Harga pemasok × unit terjual</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest shadow-sm">
          <span className="text-[11px] text-secondary uppercase font-semibold">Laba Bersih Kas PKK (+Rp1.000/pcs)</span>
          <p className="text-headline-md font-headline-md text-primary font-bold mt-1">{rupiah(s?.profit ?? 0)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{s?.units_sold ?? 0} Pcs × Rp1.000</span>
        </div>
      </div>

      {/* Jurnal */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container-highest flex flex-wrap items-center justify-between gap-2">
          <span className="text-label-md font-label-md text-on-surface">Jurnal Transaksi ({periodLabel})</span>
          <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Hanya pesanan berstatus Selesai yang dihitung
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-md font-body-md">
            <thead className="bg-surface-container-lowest text-secondary text-label-sm font-label-sm uppercase tracking-wider border-b border-surface-container-highest">
              <tr>
                <th className="px-4 py-2.5">Produk</th>
                <th className="px-4 py-2.5">Pemasok</th>
                <th className="px-4 py-2.5 text-center">Masuk</th>
                <th className="px-4 py-2.5 text-center">Keluar</th>
                <th className="px-4 py-2.5 text-center">Adj.</th>
                <th className="px-4 py-2.5 text-center">Sisa</th>
                <th className="px-4 py-2.5 text-right">Harga Siswa</th>
                <th className="px-4 py-2.5 text-right">Harga Etalase</th>
                <th className="px-4 py-2.5 text-right">Laba Kas</th>
                <th className="px-4 py-2.5 text-right font-bold text-on-surface">Subtotal Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {loading && !data && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-secondary">Memuat...</td></tr>
              )}
              {data && data.rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-secondary">
                    <Icon name="receipt_long" className="text-[40px] text-surface-container-highest" />
                    <p className="font-bold mt-1">Belum ada transaksi pada periode ini</p>
                  </td>
                </tr>
              )}
              {data?.rows.map((r) => (
                <tr key={r.product_id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-on-surface">{r.product}</td>
                  <td className="px-4 py-3 text-secondary text-sm">{r.supplier} <span className="text-[11px]">({r.supplier_class})</span></td>
                  <td className="px-4 py-3 text-center text-sm">{r.in}</td>
                  <td className="px-4 py-3 text-center font-bold text-primary text-sm">{r.out}</td>
                  <td className={`px-4 py-3 text-center text-sm ${r.adjust < 0 ? 'text-error' : ''}`}>
                    {r.adjust === 0 ? '-' : r.adjust > 0 ? `+${r.adjust}` : r.adjust}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{r.left}</td>
                  <td className="px-4 py-3 text-right text-sm">{rupiah(r.supplier_price)}</td>
                  <td className="px-4 py-3 text-right text-sm">{rupiah(r.display_price)}</td>
                  <td className="px-4 py-3 text-right text-primary font-bold text-sm">+{rupiah(r.profit)}</td>
                  <td className="px-4 py-3 text-right font-bold text-on-surface text-sm">{rupiah(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
            {data && data.rows.length > 0 && (
              <tfoot className="bg-surface-container-low font-bold text-on-surface border-t-2 border-surface-container-highest">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>Total Grand</td>
                  <td className="px-4 py-3 text-center">{s.units_in}</td>
                  <td className="px-4 py-3 text-center text-primary">{s.units_sold}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-center">{s.units_left}</td>
                  <td className="px-4 py-3 text-right text-secondary" colSpan={2}>Hak Siswa: {rupiah(s.supplier_share)}</td>
                  <td className="px-4 py-3 text-right text-primary">{rupiah(s.profit)}</td>
                  <td className="px-4 py-3 text-right text-headline-sm font-headline-sm text-primary">{rupiah(s.revenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Catatan penyesuaian manual */}
      {data?.adjustments.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-surface-container-highest text-label-md font-label-md text-on-surface">
            Catatan Penyesuaian Manual
          </div>
          <ul className="divide-y divide-surface-container-highest">
            {data.adjustments.map((a) => (
              <li key={a.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-body-sm">
                <div>
                  <span className="font-semibold text-on-surface">{a.product}</span>
                  <span className={`ml-2 font-bold ${a.quantity < 0 ? 'text-error' : 'text-emerald-700'}`}>
                    {a.quantity > 0 ? `+${a.quantity}` : a.quantity} Pcs
                  </span>
                  <p className="text-secondary">{a.note}</p>
                </div>
                <span className="text-[11px] text-secondary">{a.movement_date} • oleh {a.admin_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAdjust && (
        <AdjustModal
          onClose={() => setShowAdjust(false)}
          onSaved={() => {
            setShowAdjust(false)
            load()
          }}
        />
      )}
    </section>
  )
}   
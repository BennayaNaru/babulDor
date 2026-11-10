import { useCallback, useEffect, useState } from 'react'
import api from '../../lib/api'
import Icon from '../../components/Icon'
import ProductImage from '../../components/ProductImage'
import { useToast } from '../../context/ToastContext'
import { errorMessages } from '../../lib/errors'
import { rupiah } from '../../lib/format'

const checklist = [
  ['is_clean', 'Bersih & higienis'],
  ['is_packaging_ok', 'Kemasan tertutup rapat (segel baik)'],
  ['is_fresh', 'Segar / masa kadaluarsa masih berlaku'],
  ['is_consumable', 'Layak konsumsi (uji rasa)'],
]

function ReviewModal({ item, intent, onClose, onDone }) {
  const { showToast } = useToast()
  const [checks, setChecks] = useState({ is_clean: true, is_packaging_ok: true, is_fresh: true, is_consumable: true })
  const [rejecting, setRejecting] = useState(intent === 'tolak')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const allPassed = Object.values(checks).every(Boolean)

  async function submit(result) {
    if (result === 'tolak' && !notes.trim()) {
      setError('Harap masukkan alasan penolakan agar siswa dapat memperbaikinya.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api.post(`/admin/submissions/${item.id}/review`, {
        ...checks,
        result,
        notes: result === 'tolak' ? notes.trim() : null,
      })
      showToast(
        result === 'acc'
          ? `Produk ${item.name} berhasil di-ACC & masuk ke etalase!`
          : `Dagangan ${item.name} ditolak dengan catatan.`
      )
      onDone(item.id)
    } catch (err) {
      setError(errorMessages(err).join(' '))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-surface-container-highest shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Verifikasi: {item.name}</h3>
          <button onClick={onClose} className="text-secondary hover:text-on-surface">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-3 bg-surface-container-low rounded-xl text-body-sm space-y-1">
          <p className="font-bold text-on-surface">{item.name} ({item.category?.name})</p>
          <p className="text-xs text-secondary">
            Stok: {item.stock} Pcs | Harga Etalase: {rupiah(item.display_price)}
          </p>
        </div>

        <div className="space-y-2 text-body-sm">
          {checklist.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <span>{label}</span>
            </label>
          ))}
          {!allPassed && !rejecting && (
            <p className="text-[11px] text-error">Ada poin yang tidak lolos. Produk hanya bisa ditolak.</p>
          )}
        </div>

        {rejecting && (
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-error">Alasan Penolakan (Wajib Diisi):</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kemasan plastik tidak di-press, rentan tumpah..."
              className="w-full p-2.5 rounded-xl border border-surface-container-highest text-body-sm outline-none focus:border-error"
            />
          </div>
        )}

        {error && <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button
            disabled={busy}
            onClick={() => (rejecting ? submit('tolak') : setRejecting(true))}
            className="flex-1 py-2 rounded-xl border border-error text-error hover:bg-error-container/20 font-label-md disabled:opacity-50"
          >
            {rejecting ? 'Konfirmasi Tolak Dagangan' : 'Tolak Dagangan'}
          </button>
          {!rejecting && (
            <button
              disabled={busy || !allPassed}
              onClick={() => submit('acc')}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Setujui (ACC)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifikasiPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState(null) // { item, intent }

  const load = useCallback(() => {
    api.get('/admin/submissions')
      .then((res) => {
        setItems(res.data.data)
        setError('')
      })
      .catch(() => setError('Gagal memuat antrean pengajuan.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 20000)
    return () => clearInterval(timer)
  }, [load])

  function handleDone(id) {
    setItems((list) => list.filter((i) => i.id !== id))
    setActive(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Pemeriksaan Kelayakan Dagangan Siswa</h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Checklist standar operasional sebelum makanan disajikan di etalase kantin sekolah.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-label-md font-label-md flex items-center gap-1 self-start">
          <Icon name="verified" className="text-[18px]" /> SOP Higienis & Lab Halal
        </span>
      </div>

      {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && items.length === 0 && <div className="h-64 rounded-2xl bg-surface-container animate-pulse" />}

        {!loading && !error && items.length === 0 && (
          <div className="col-span-full py-12 text-center text-secondary bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-6">
            <Icon name="task_alt" className="text-[48px] text-emerald-600" />
            <p className="font-bold text-headline-sm mt-2">Semua Dagangan Telah Teruji</p>
            <p className="text-body-sm">Tidak ada antrean pengajuan produk baru dari siswa.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest shadow-sm overflow-hidden flex flex-col">
            <div className="h-36 bg-surface-container">
              <ProductImage product={item} iconSize="text-[56px]" />
            </div>
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Menunggu Uji Higienis</span>
                <span className="text-label-sm font-label-sm text-secondary font-mono">PKK-P{String(item.id).padStart(2, '0')}</span>
              </div>

              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">{item.name}</h3>
                <p className="text-body-sm text-secondary">
                  Kategori: {item.category?.name} • Stok Diajukan: {item.stock} Pcs
                </p>
                <p className="text-[12px] text-secondary mt-1 flex items-center gap-1">
                  <Icon name="school" className="text-[14px] text-primary" />
                  {item.supplier?.name} • {item.supplier?.class}
                </p>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl text-body-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-secondary">Harga Siswa:</span>
                  <span className="font-semibold">{rupiah(item.supplier_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Harga Jual (+1k Kas):</span>
                  <span className="font-bold text-primary">{rupiah(item.display_price)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 mt-auto">
                <button onClick={() => setActive({ item, intent: 'acc' })} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-label-md shadow-sm flex items-center justify-center gap-1">
                  <Icon name="check" className="text-[16px]" /> ACC
                </button>
                <button onClick={() => setActive({ item, intent: 'tolak' })} className="flex-1 py-2 rounded-xl border border-error text-error hover:bg-error-container/20 font-label-md flex items-center justify-center gap-1">
                  <Icon name="close" className="text-[16px]" /> Tolak
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <ReviewModal
          key={active.item.id}
          item={active.item}
          intent={active.intent}
          onClose={() => setActive(null)}
          onDone={handleDone}
        />
      )}
    </section>
  )
}
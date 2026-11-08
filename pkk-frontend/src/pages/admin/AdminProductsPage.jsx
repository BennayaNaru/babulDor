import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Icon from '../../components/Icon'
import { useToast } from '../../context/ToastContext'
import { friendlyMessage } from '../../lib/errors'
import { rupiah } from '../../lib/format'

const selectCls =
  'bg-surface-container-low border border-surface-container-highest rounded-xl text-body-sm px-3 py-2 outline-none focus:border-primary'

export default function AdminProductsPage({ readOnly = false }) {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const [target, setTarget] = useState(null) // produk yang akan dihapus
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {})
  }, [])

  // muat daftar setiap filter/halaman berubah (ditunda 250 ms saat mengetik)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      api
        .get('/admin/products', {
          params: { q: q.trim(), category_id: categoryId || undefined, status: status || undefined, page },
        })
        .then((res) => {
          if (cancelled) return
          // halaman terakhir kosong setelah hapus → mundur satu halaman
          if (res.data.data.length === 0 && page > 1) {
            setPage(page - 1)
            return
          }
          setItems(res.data.data)
          setMeta(res.data.meta)
          setError('')
        })
        .catch(() => !cancelled && setError('Gagal memuat daftar produk.'))
        .finally(() => !cancelled && setLoading(false))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [q, categoryId, status, page, reload])

  async function toggle(p) {
    const next = p.status === 'disetujui' ? 'nonaktif' : 'disetujui'
    setBusyId(p.id)
    try {
      await api.patch(`/admin/products/${p.id}/status`, { status: next })
      showToast(next === 'nonaktif' ? `${p.name} disembunyikan dari katalog.` : `${p.name} kembali tayang di katalog.`)
      setReload((n) => n + 1)
    } catch (err) {
      window.alert(friendlyMessage(err, 'Gagal mengubah status produk.'))
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/admin/products/${target.id}`)
      showToast('Produk berhasil dihapus dari katalog.')
      setTarget(null)
      setReload((n) => n + 1)
    } catch (err) {
      setDeleteError(friendlyMessage(err, 'Gagal menghapus produk.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Manajemen Katalog & Inventaris</h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Kontrol status tayang, stok, dan penghapusan produk dari katalog sekolah.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-highest shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Icon name="search" className="absolute left-3 top-2.5 text-secondary text-[18px]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Cari nama produk atau pemasok..."
            className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-body-sm font-body-sm border border-surface-container-highest outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(1)
            }}
            className={selectCls}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className={selectCls}
          >
            <option value="">Semua Status</option>
            <option value="disetujui">Tayang</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
          <span className="text-label-sm font-label-sm px-2.5 py-1.5 bg-surface-container-low rounded-xl text-secondary">
            {meta?.total ?? 0} Produk
          </span>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

      {/* Tabel */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-md font-body-md">
            <thead className="bg-surface-container-low text-secondary text-label-sm font-label-sm uppercase tracking-wider border-b border-surface-container-highest">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Pemasok Siswa</th>
                <th className="px-4 py-3">Harga Pemasok</th>
                <th className="px-4 py-3">Harga Jual (+1k)</th>
                <th className="px-4 py-3">Sisa Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-secondary">Memuat...</td></tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-secondary">
                    <Icon name="inventory_2" className="text-[40px] text-surface-container-highest" />
                    <p className="font-bold mt-1">Tidak ada produk</p>
                    <p className="text-body-sm">Ubah kata kunci atau filter pencarian.</p>
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-on-surface block">{p.name}</span>
                    <span className="text-[11px] text-secondary">{p.category?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-secondary text-sm">
                    {p.supplier?.name}
                    <span className="block text-[11px]">{p.supplier?.class}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm">{rupiah(p.supplier_price)}</td>
                  <td className="px-4 py-3 text-primary font-bold text-sm">{rupiah(p.display_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${p.stock > 5 ? 'text-on-surface' : 'text-error'}`}>{p.stock} Pcs</span>
                  </td>
                  <td className="px-4 py-3">
                    <label className={`relative inline-flex items-center gap-2 ${readOnly ? '' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={p.status === 'disetujui'}
                        onChange={() => toggle(p)}
                        disabled={readOnly || busyId === p.id}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-surface-container-highest rounded-full peer-checked:bg-primary peer-disabled:opacity-60 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      <span className="text-[11px] text-secondary">{p.status === 'disetujui' ? 'Tayang' : 'Nonaktif'}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {readOnly ? (
                      <span className="text-[11px] text-secondary italic">Hanya Baca</span>
                    ) : (
                      <button
                        onClick={() => {
                          setDeleteError('')
                          setTarget(p)
                        }}
                        title="Hapus dari katalog"
                        className="p-1.5 rounded-lg hover:bg-error-container/40 text-secondary hover:text-error"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.total > 0 && (
          <div className="px-4 py-3 bg-surface-container-low border-t border-surface-container-highest flex flex-wrap items-center justify-between gap-2 text-body-sm font-body-sm text-secondary">
            <span>Menampilkan {meta.from}-{meta.to} dari {meta.total} item</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-1 rounded-lg border border-surface-container-highest bg-white text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Sebelumnya
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-2.5 py-1 rounded-lg ${n === meta.current_page ? 'bg-primary text-white font-bold' : 'border border-surface-container-highest bg-white text-secondary'}`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(page + 1)}
                className="px-2.5 py-1 rounded-lg border border-surface-container-highest bg-white text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Konfirmasi hapus */}
      {target && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !deleting && setTarget(null)}>
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-surface-container-highest shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error">
              <Icon name="delete" fill className="text-[26px]" />
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Hapus {target.name}?</h3>
              <p className="text-body-sm font-body-sm text-secondary mt-1">
                Produk dari <strong>{target.supplier?.name}</strong> akan dihapus dari katalog sekolah.
              </p>
            </div>
            <ul className="text-body-sm text-secondary space-y-1 bg-surface-container-low p-3 rounded-xl border border-surface-container-highest">
              <li>• Sisa stok <strong className="text-on-surface">{target.stock} Pcs</strong> dicatat sebagai penarikan.</li>
              <li>• Riwayat penjualan dan laporan tetap tersimpan.</li>
              <li>• Cukup sembunyikan lewat saklar status jika pemasok hanya libur sementara.</li>
            </ul>

            {deleteError && (
              <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md flex items-start gap-2">
                <Icon name="error" className="text-[18px] shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button disabled={deleting} onClick={() => setTarget(null)} className="flex-1 py-2.5 rounded-xl border border-surface-container-highest text-secondary hover:bg-surface-container-low font-label-md">
                Batal
              </button>
              <button disabled={deleting} onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-error text-white hover:opacity-90 font-label-md shadow-sm disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
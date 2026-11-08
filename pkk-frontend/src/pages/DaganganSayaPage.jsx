import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Icon from '../components/Icon'
import { rupiah } from '../lib/format'
import { productStatus } from '../lib/productStatus'

const tabs = [
  ['all', 'Semua'],
  ['menunggu', 'Menunggu Review'],
  ['disetujui', 'Disetujui'],
  ['ditolak', 'Ditolak'],
]

export default function DaganganSayaPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  const load = useCallback(() => {
    api.get('/my-products')
      .then((res) => {
        setItems(res.data.data)
        setError('')
      })
      .catch(() => setError('Gagal memuat dagangan.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)   // hasil pemeriksaan pengurus muncul otomatis
    return () => clearInterval(timer)
  }, [load])

  const count = (key) => (key === 'all' ? items.length : items.filter((i) => i.status === key).length)
  const visible = tab === 'all' ? items : items.filter((i) => i.status === tab)

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Status Dagangan Titipan Saya</h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Pantau proses kelayakan dan persetujuan produk oleh Pengurus PKK.
          </p>
        </div>
        <button onClick={() => navigate('/ajukan')} className="px-4 py-2 bg-primary text-white rounded-xl text-label-md font-label-md flex items-center gap-1.5 shadow-sm hover:bg-primary-container self-start">
          <Icon name="add" className="text-[18px]" /> Ajukan Produk Lain
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-container-highest pb-2 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-label-md font-label-md shrink-0 ${
              tab === key ? 'bg-surface-container-high text-on-surface' : 'text-secondary hover:text-on-surface'
            }`}
          >
            {label} ({count(key)})
          </button>
        ))}
      </div>

      {error && <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md">{error}</div>}

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-md font-body-md">
            <thead className="bg-surface-container-low text-secondary text-label-sm font-label-sm uppercase tracking-wider border-b border-surface-container-highest">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga Siswa</th>
                <th className="px-4 py-3">Harga Etalase</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status Verifikasi</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-secondary">Memuat...</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-secondary">
                    <Icon name="inventory_2" className="text-[40px] text-surface-container-highest" />
                    <p className="font-bold mt-1">Belum ada dagangan</p>
                    <p className="text-body-sm">Ajukan produk pertamamu lewat tombol di atas.</p>
                  </td>
                </tr>
              )}
              {visible.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-on-surface block">{p.name}</span>
                    <span className="text-[11px] text-secondary">ID: PKK-P{String(p.id).padStart(2, '0')}</span>
                    {p.rejection_reason && (
                      <div className="mt-1 p-2 bg-error-container/40 text-on-error-container rounded-lg text-xs">
                        <strong>Catatan Pengurus:</strong> {p.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary text-sm">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold text-sm">{rupiah(p.supplier_price)}</td>
                  <td className="px-4 py-3 text-primary font-bold text-sm">{rupiah(p.display_price)}</td>
                  <td className="px-4 py-3 font-medium text-sm">{p.stock} Pcs</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${productStatus[p.status].badge}`}>
                      {productStatus[p.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'ditolak' ? (
                      <button onClick={() => navigate(`/ajukan/${p.id}`)} className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-label-sm font-label-sm text-primary font-semibold">
                        Edit & Ajukan Ulang
                      </button>
                    ) : (
                      <span className="text-secondary text-xs italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
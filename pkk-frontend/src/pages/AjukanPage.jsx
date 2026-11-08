import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import Icon from '../components/Icon'
import { useToast } from '../context/ToastContext'
import { errorMessages } from '../lib/errors'
import { rupiah } from '../lib/format'

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-surface-container-highest focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none'

export default function AjukanPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', category_id: '', supplier_price: '', stock: '', description: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [rejection, setRejection] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.data)
      setForm((f) => (f.category_id ? f : { ...f, category_id: res.data.data[0]?.id ?? '' }))
    })
  }, [])

  // mode edit: isi form dari dagangan yang ditolak
  useEffect(() => {
    if (!isEdit) return
    api.get('/my-products')
      .then((res) => {
        const p = res.data.data.find((x) => String(x.id) === id)
        if (!p || p.status !== 'ditolak') {
          navigate('/dagangan-saya', { replace: true })
          return
        }
        setForm({
          name: p.name,
          category_id: p.category.id,
          supplier_price: p.supplier_price,
          stock: p.stock,
          description: p.description ?? '',
        })
        setPreview(p.image_url)
        setRejection(p.rejection_reason ?? '')
      })
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const supplierPrice = parseInt(form.supplier_price) || 0
  const displayPrice = supplierPrice + 1000

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      setErrors(['Foto produk maksimal 2 MB.'])
      return
    }
    setErrors([])
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    setSubmitting(true)

    const body = new FormData()
    Object.entries(form).forEach(([k, v]) => body.append(k, v))
    if (file) body.append('image', file)

    try {
      await api.post(isEdit ? `/my-products/${id}` : '/my-products', body)
      showToast(
        isEdit
          ? 'Dagangan berhasil diajukan ulang.'
          : 'Pengajuan dagangan berhasil dikirim untuk diuji kelayakannya!'
      )
      navigate('/dagangan-saya')
    } catch (err) {
      setErrors(errorMessages(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto h-64 rounded-2xl bg-surface-container animate-pulse" />

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(isEdit ? '/dagangan-saya' : '/katalog')} className="p-2 rounded-xl hover:bg-surface-container-low text-secondary">
          <Icon name="arrow_back" />
        </button>
        <div>
          <h1 className="text-headline-md font-headline-md text-on-surface">
            {isEdit ? 'Perbaiki & Ajukan Ulang Dagangan' : 'Form Pengajuan Dagangan Baru'}
          </h1>
          <p className="text-body-sm font-body-sm text-secondary">
            Setiap produk siswa akan diperiksa kelayakannya oleh Pengurus PKK sebelum tampil di etalase.
          </p>
        </div>
      </div>

      {isEdit && rejection && (
        <div className="p-3 bg-error-container/40 text-on-error-container rounded-xl text-body-sm">
          <strong>Catatan Pengurus:</strong> {rejection}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-highest shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Nama Produk Kreatif <span className="text-error">*</span></label>
            <input className={inputCls} value={form.name} onChange={setField('name')} placeholder="Contoh: Risol Mayo Smoked Beef" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Kategori Produk <span className="text-error">*</span></label>
            <select className={inputCls} value={form.category_id} onChange={setField('category_id')} required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Harga Pemasok (Untuk Kamu) <span className="text-error">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-secondary text-body-md font-semibold">Rp</span>
              <input type="number" min="1000" max="1000000" className={`${inputCls} pl-10 font-semibold`} value={form.supplier_price} onChange={setField('supplier_price')} placeholder="5000" required />
            </div>
            <p className="text-[11px] text-secondary">Nominal bersih yang diterima siswa per produk yang terjual.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-label-md font-label-md text-on-surface">Jumlah Stok Dititipkan (Pcs) <span className="text-error">*</span></label>
            <input type="number" min="1" max="150" className={inputCls} value={form.stock} onChange={setField('stock')} placeholder="20" required />
            <p className="text-[11px] text-secondary">Harus disetor ke Kantin PKK pagi sebelum bel masuk pukul 07.15 WIB.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest space-y-2">
          <div className="flex items-center justify-between text-body-sm font-body-sm">
            <span className="text-secondary">Harga Dasar Siswa:</span>
            <span className="font-semibold text-on-surface">{rupiah(supplierPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm font-body-sm">
            <span className="text-secondary flex items-center gap-1">
              Laba Kas Koperasi PKK:
              <Icon name="info" className="text-[15px] text-primary" />
            </span>
            <span className="font-semibold text-primary">+ Rp1.000</span>
          </div>
          <div className="h-[1px] bg-surface-container-highest my-1" />
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md text-on-surface">Harga Jual di Etalase (Pembeli):</span>
            <span className="text-currency-md font-currency-md text-primary font-bold">{rupiah(displayPrice)}</span>
          </div>
          <p className="text-[11px] text-secondary italic">Catatan: Setiap produk otomatis ditambahkan Rp1.000 untuk kas operasional PKK sekolah.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-label-md font-label-md text-on-surface">Deskripsi & Komposisi Singkat <span className="text-error">*</span></label>
          <textarea rows={3} className={inputCls} value={form.description} onChange={setField('description')} placeholder="Jelaskan keunggulan, bahan higienis, dan ukuran porsi produkmu..." required />
        </div>

        <div className="space-y-1.5">
          <label className="text-label-md font-label-md text-on-surface">Foto Produk</label>
          <label className="block border-2 border-dashed border-surface-container-highest hover:border-primary rounded-xl p-5 text-center transition-colors cursor-pointer bg-surface-bright">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
            {preview ? (
              <div className="space-y-2">
                <img src={preview} alt="Pratinjau" className="mx-auto h-32 w-32 object-cover rounded-xl" />
                <p className="text-[11px] text-secondary">Klik untuk mengganti foto</p>
              </div>
            ) : (
              <>
                <Icon name="add_a_photo" className="text-[36px] text-secondary" />
                <p className="text-label-md font-label-md text-on-surface mt-1">Klik untuk pilih foto produk</p>
                <p className="text-[11px] text-secondary">Format JPG, PNG, WEBP (Maks 2MB) - Disarankan rasio 1:1</p>
              </>
            )}
          </label>
        </div>

        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-label-md font-label-md space-y-1">
            {errors.map((m, i) => (
              <p key={i} className="flex items-start gap-2"><Icon name="error" className="text-[18px] shrink-0" />{m}</p>
            ))}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(isEdit ? '/dagangan-saya' : '/katalog')} className="px-5 py-2.5 rounded-xl border border-surface-container-highest text-secondary hover:bg-surface-container-low font-label-md">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container font-label-md shadow-sm transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-60">
            <Icon name="send" className="text-[18px]" />
            <span>{submitting ? 'Mengirim...' : isEdit ? 'Ajukan Ulang' : 'Kirim untuk Verifikasi'}</span>
          </button>
        </div>
      </form>
    </section>
  )
}
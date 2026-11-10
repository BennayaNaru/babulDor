import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'
import { homeByRole } from '../lib/roles'
import { friendlyMessage } from '../lib/errors'

// Hanya tampil saat development (npm run dev). Data cocok dengan AdminSeeder.
const demoAccounts = [
    {
        title: 'Siswa Demo', sub: 'NISN: 0000000001 • XI RPL', initial: 'S',
        tone: 'bg-red-100 text-primary',
        data: { identifier: '0000000001', name: 'Siswa Demo', kelas: 'XI RPL' },
    },
    {
        title: 'Pengurus Demo', sub: 'ID: 0000000003 • Pengurus PKK', initial: 'K',
        tone: 'bg-orange-100 text-tertiary',
        data: { identifier: '0000000003', name: 'Pengurus Demo', kelas: 'XI AK 1' },
    },
    {
        title: 'Admin Pembina', sub: 'ID: 0000000002 • Pembina PKK', initial: 'G',
        tone: 'bg-blue-100 text-blue-800',
        data: { identifier: '0000000002', name: 'Admin Pembina', kelas: 'Pembina PKK' },
    },
]

const metrics = [
    { icon: 'local_dining', color: 'text-primary-fixed-dim', title: '100% Siswa', sub: 'Tata Boga & Kriya' },
    { icon: 'savings', color: 'text-amber-300', title: 'Rp1.000 Kas', sub: 'Margin Transparan' },
    { icon: 'verified', color: 'text-emerald-300', title: 'Terkurasi', sub: 'Guru Pembina' },
]

function Field({ id, label, hint, icon, error, ...props }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <label htmlFor={id} className="font-label-lg text-label-lg text-on-surface font-semibold">
                    {label}
                </label>
                {hint && <span className="text-label-sm font-label-sm text-secondary">{hint}</span>}
            </div>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                    <Icon name={icon} className="text-[20px]" />
                </span>
                <input
                    id={id}
                    aria-invalid={Boolean(error)}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-surface-container-lowest text-on-surface placeholder:text-secondary/60 focus:ring-2 transition-all font-body-md text-body-md ${error
                            ? 'border-error focus:border-error focus:ring-error/20'
                            : 'border-surface-container-highest focus:border-primary-container focus:ring-primary-container/20'
                        }`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-[12px] text-error flex items-center gap-1">
                    <Icon name="error" className="text-[14px]" />
                    {error}
                </p>
            )}
        </div>
    )
}
// Aturan panjang NISN/NIP (ubah di sini jika perlu)
const ID_MIN = 8
const ID_MAX = 10

// Membersihkan karakter terlarang saat mengetik
const sanitize = {
    identifier: (v) => v.replace(/\D/g, ''),               // hanya angka 0-9
    name: (v) => v.replace(/[^\p{L}\s.'-]/gu, ''),         // huruf, spasi, titik, apostrof, strip
    kelas: (v) => v,
}

// trim semua input + rapikan spasi ganda
const tidy = (v) => v.trim().replace(/\s+/g, ' ')
const normalize = (f) => ({
    identifier: f.identifier.trim(),
    name: tidy(f.name),
    kelas: tidy(f.kelas),
})

function validate(f) {
    const errs = {}

    if (!f.identifier) errs.identifier = 'NISN/NIP wajib diisi.'
    else if (!/^\d+$/.test(f.identifier)) errs.identifier = 'NISN/NIP hanya boleh berisi angka (0-9).'
    else if (f.identifier.length < ID_MIN || f.identifier.length > ID_MAX)
        errs.identifier = `NISN/NIP harus ${ID_MIN}-${ID_MAX} digit.`

    if (!f.name) errs.name = 'Nama lengkap wajib diisi.'
    else if (!/^[\p{L}\s.'-]+$/u.test(f.name)) errs.name = 'Nama hanya boleh berisi huruf.'
    else if (f.name.replace(/[^\p{L}]/gu, '').length < 2) errs.name = 'Nama minimal 2 huruf.'

    if (!f.kelas) errs.kelas = 'Kelas / jabatan wajib diisi.'

    return errs
}

export default function LoginPage() {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ identifier: '', name: '', kelas: '' })
    const [touched, setTouched] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [demoNote, setDemoNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    if (user) return <Navigate to={homeByRole[user.role]} replace />

    const errs = validate(normalize(form))
    // pesan tampil setelah kolom ditinggalkan atau setelah tombol Masuk ditekan
    const fieldError = (key) => (submitted || touched[key] ? errs[key] : undefined)

    const setField = (key) => (e) => setForm({ ...form, [key]: sanitize[key](e.target.value) })

    const blurField = (key) => () => {
        setTouched((t) => ({ ...t, [key]: true }))
        setForm((f) => ({ ...f, [key]: normalize(f)[key] })) // rapikan (trim) saat keluar dari kolom
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitted(true)
        setError('')

        const data = normalize(form)
        setForm(data)
        if (Object.keys(validate(data)).length > 0) return

        setSubmitting(true)
        try {
            const u = await login(data)
            navigate(homeByRole[u.role], { replace: true })
        } catch (err) {
            setError(friendlyMessage(err))
        } finally {
            setSubmitting(false)
        }
    }

    function fillDemo(acc) {
        setForm(acc.data)
        setTouched({})
        setSubmitted(false)
        setError('')
        setDemoNote(acc.title)
    }

    return (
        <main className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden">
            {/* ================= KIRI: SHOWCASE ================= */}
            <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden bg-inverse-surface text-white">
                <img
                    alt="Karya Kuliner Siswa SMK"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    src="/images/hero-kuliner.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/60 pointer-events-none" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply pointer-events-none" />

                <header className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                        <img alt="Logo PKK" className="h-9 w-9 rounded-lg object-contain bg-white p-1" src="/images/logo.png" />
                        <div>
                            <span className="block font-headline-sm text-headline-sm text-white tracking-tight leading-tight">PKK Hub SMK</span>
                            <span className="block font-label-sm text-label-sm text-primary-fixed-dim leading-none">Kewirausahaan Merah Putih</span>
                        </div>
                    </div>
                    <div className="hidden sm:inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white font-label-md text-label-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Kantin Buka • Siap Melayani</span>
                    </div>
                </header>

                <div className="relative z-10 my-auto py-8 lg:py-0 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white font-label-sm text-label-sm uppercase tracking-wider mb-4 shadow-sm">
                        <Icon name="restaurant_menu" fill className="text-[16px]" />
                        Produk Kreatif & Kewirausahaan
                    </div>
                    <h1 className="font-headline-lg text-headline-lg sm:text-[34px] sm:leading-[42px] text-white font-extrabold tracking-tight mb-4">
                        Dukung Kreativitas & Jajanan Karya Siswa Mandiri
                    </h1>
                    <p className="hidden sm:block font-body-lg text-body-lg text-surface-container-high/90 max-w-lg mb-8 leading-relaxed">
                        Setiap gigitan melatih jiwa wirausaha muda, menjamin higienitas kantin sekolah, dan menggerakkan
                        ekonomi berbasis praktik kejuruan nyata.
                    </p>
                    <div className="hidden sm:grid sm:grid-cols-3 gap-3">
                        {metrics.map((m) => (
                            <div key={m.title} className="bg-black/50 backdrop-blur-md border border-white/15 p-3.5 rounded-xl flex items-start gap-3">
                                <Icon name={m.icon} fill className={`${m.color} p-2 bg-white/10 rounded-lg`} />
                                <div>
                                    <p className="font-headline-sm text-headline-sm text-white leading-tight">{m.title}</p>
                                    <p className="font-body-sm text-body-sm text-surface-variant leading-tight mt-0.5">{m.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="relative z-10 flex items-center justify-between pt-4 border-t border-white/15 text-surface-container-high/80 text-xs">
                    <p className="flex items-center gap-1.5 font-body-sm text-body-sm">
                        <Icon name="school" className="text-[16px] text-primary-fixed" />
                        SMK Negeri Unggulan • Unit Produksi PKK
                    </p>
                </footer>
            </div>

            {/* ================= KANAN: FORM LOGIN ================= */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-surface">
                <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-2xl p-6 sm:p-8 custom-shadow border border-surface-container-highest">
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm mb-3">
                            <Icon name="lock" className="text-[14px]" />
                            Sistem Autentikasi Terpadu
                        </div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Selamat Datang Kembali</h2>
                        <p className="font-body-md text-body-md text-secondary mt-1">
                            Masuk dengan data akun terdaftar untuk mulai belanja atau kelola dagangan PKK sekolah.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
                            <Icon name="error" className="text-[18px]" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <Field
                            id="identifier" label="NISN atau NIP" hint={`${ID_MIN}-${ID_MAX} digit angka`} icon="badge"
                            inputMode="numeric" maxLength={ID_MAX} autoComplete="off" placeholder="Contoh: 0072819281"
                            value={form.identifier} onChange={setField('identifier')} onBlur={blurField('identifier')}
                            error={fieldError('identifier')}
                        />
                        <Field
                            id="name" label="Nama Lengkap" hint="Minimal 2 huruf" icon="person"
                            maxLength={100} autoComplete="off" placeholder="Sesuai data sekolah"
                            value={form.name} onChange={setField('name')} onBlur={blurField('name')}
                            error={fieldError('name')}
                        />
                        <Field
                            id="kelas" label="Kelas / Jabatan" hint="Siswa: kelas • Guru: jabatan" icon="school"
                            maxLength={50} autoComplete="off" placeholder="Contoh: XI RPL"
                            value={form.kelas} onChange={setField('kelas')} onBlur={blurField('kelas')}
                            error={fieldError('kelas')}
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memverifikasi Akun...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Aplikasi PKK</span>
                                    <Icon name="arrow_forward" className="text-[20px]" />
                                </>
                            )}
                        </button>
                    </form>

                    {(import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO === 'true') && (
                        <div className="mt-6 pt-5 border-t border-surface-container-highest">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                    <Icon name="play_arrow" className="text-[16px] text-primary" />
                                    Akun Coba Cepat (Demo)
                                </span>
                                <span className="text-[11px] text-secondary/70">Klik untuk isi formulir</span>
                            </div>

                            {demoNote && (
                                <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-label-sm text-label-sm flex items-center gap-2">
                                    <Icon name="info" className="text-[18px] text-amber-700" />
                                    <span>Formulir terisi: <strong>{demoNote}</strong></span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                                {demoAccounts.map((acc) => (
                                    <button
                                        key={acc.title}
                                        type="button"
                                        onClick={() => fillDemo(acc)}
                                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-surface-container hover:border-primary-container/40 bg-surface-container-low hover:bg-surface-container transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${acc.tone}`}>
                                                {acc.initial}
                                            </div>
                                            <div>
                                                <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{acc.title}</p>
                                                <p className="font-body-sm text-body-sm text-secondary">{acc.sub}</p>
                                            </div>
                                        </div>
                                        <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center">
                                            Pilih <Icon name="chevron_right" className="text-[16px]" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-surface-container-highest text-center space-y-2">
                        <p className="font-body-sm text-body-sm text-secondary">
                            Belum punya akun?{' '}
                            <button type="button" onClick={() => setShowHelp(true)} className="font-semibold text-primary hover:underline">
                                Hubungi Pengurus PKK untuk didaftarkan
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* ================= MODAL BANTUAN ================= */}
            {showHelp && (
                <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
                    <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-surface-container-highest" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-4">
                            <Icon name="assignment_ind" fill className="text-[28px]" />
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Pendaftaran & Akses Akun PKK</h3>
                        <p className="font-body-md text-body-md text-secondary mb-4">
                            Akun dibuat oleh pengurus PKK dari data sekolah. Tidak ada pendaftaran mandiri.
                        </p>
                        <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container-highest mb-5 space-y-2 text-on-surface">
                            {[
                                ['Siswa/Guru Baru:', 'Minta pengurus PKK mendaftarkan NISN/NIP, nama, dan kelas/jabatanmu.'],
                                ['Data Tidak Cocok:', 'Pastikan penulisan nama dan kelas sama dengan data sekolah, atau minta pengurus memeriksanya.'],
                                ['Jam Pelayanan:', 'Setiap hari kerja (07.00 - 15.30 WIB).'],
                            ].map(([b, t]) => (
                                <div key={b} className="flex items-start gap-2">
                                    <Icon name="check_circle" className="text-[18px] text-primary shrink-0 mt-0.5" />
                                    <p className="font-body-sm text-body-sm"><strong>{b}</strong> {t}</p>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => setShowHelp(false)} className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
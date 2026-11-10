// Pesan aman untuk pengguna. Detail teknis (SQL, stack trace, nama model) tidak pernah ditampilkan.
export function friendlyMessage(err, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  const res = err.response

  if (!res) return 'Tidak dapat terhubung ke server. Periksa koneksi internetmu lalu coba lagi.'
  if (res.status >= 500) return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
  if (res.status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
  if (res.status === 404) return 'Data tidak ditemukan.'

  // pesan buatan kita sendiri (login salah, stok kurang, dll.)
  if ([401, 403, 422].includes(res.status) && res.data?.message) return res.data.message

  return fallback
}

// Daftar pesan validasi dari Laravel (422), atau satu pesan aman jika bukan validasi
export function errorMessages(err, fallback) {
  const res = err.response
  const errors = res?.data?.errors

  if (res && res.status < 500 && errors) return Object.values(errors).flat()
  return [friendlyMessage(err, fallback)]
}
// Ambil semua pesan error dari respons Laravel (422 berisi `errors`)
export function errorMessages(err, fallback = 'Terjadi kesalahan. Coba lagi.') {
  const errors = err.response?.data?.errors
  if (errors) return Object.values(errors).flat()
  return [err.response?.data?.message ?? fallback]
}
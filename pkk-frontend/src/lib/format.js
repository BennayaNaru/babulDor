export const rupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

export const todayString = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

export const formatDate = (ymd) =>
  new Date(`${ymd}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
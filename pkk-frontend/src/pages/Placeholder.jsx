export default function Placeholder({ title }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-8">
      <h1 className="text-headline-md font-headline-md text-on-surface">{title}</h1>
      <p className="text-body-md font-body-md text-secondary mt-1">Halaman ini diisi pada fase berikutnya.</p>
    </div>
  )
}
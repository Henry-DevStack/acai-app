import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 flex items-center bg-cream/95 px-4 py-4 backdrop-blur">
      <button onClick={() => navigate(-1)} className="p-1 text-ink" aria-label="Voltar">
        <ChevronLeft size={28} />
      </button>
      <h1 className="flex-1 pr-8 text-center font-display text-xl font-extrabold">{title}</h1>
    </header>
  )
}

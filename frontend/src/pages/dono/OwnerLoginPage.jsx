import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api, isPrototype, ownerToken } from '../../services/api'

export default function OwnerLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { token } = await api.login(password)
      ownerToken.set(token)
      navigate('/dono/pedidos', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-acai px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-cream p-6">
        <Lock className="text-acai" />
        <h1 className="mt-3 font-display text-2xl font-black">Painel da loja</h1>
        <p className="text-sm text-muted">Entre com a senha do dono.</p>
        <input type="password" className="input mt-5" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <button className="btn-primary mt-4 w-full">Entrar</button>
        {isPrototype && <p className="mt-3 text-center text-xs text-muted">Modo protótipo: a senha é acai123</p>}
      </form>
    </div>
  )
}

export function Loading() {
  return <p className="p-10 text-center text-muted">Carregando…</p>
}

export function ErrorMessage({ message }) {
  return <p className="m-4 rounded-xl bg-red-50 p-4 text-center text-sm text-danger">{message}</p>
}

// Moldura das telas do cliente: largura de celular, centralizada no desktop.
export default function Screen({ children, className = '' }) {
  return <div className={`mx-auto min-h-screen max-w-md bg-cream ${className}`}>{children}</div>
}

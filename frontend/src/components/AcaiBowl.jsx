// Ilustração do copo de açaí com os complementos por cima.
// Fica no lugar das fotos do PDF até a loja ter fotos próprias.
export default function AcaiBowl({ toppings = [], className = '', soldOut = false }) {
  return (
    <div
      className={`relative flex items-end justify-center overflow-hidden bg-gradient-to-b from-[#efe3d3] to-[#e2cfb8] ${className} ${soldOut ? 'grayscale' : ''}`}
    >
      <div
        className="relative mb-[-14%] aspect-square h-[92%] max-w-[85%] rounded-full bg-gradient-to-b from-acai-light to-acai-dark shadow-[inset_0_-12px_30px_rgba(0,0,0,0.35)]"
        style={{ containerType: 'inline-size' }}
      >
        <div className="absolute inset-x-[10%] top-[10%] flex flex-wrap justify-center gap-[2cqw] text-[18cqw] leading-none">
          {toppings.slice(0, 6).map((t, i) => (
            <span key={i} className="drop-shadow">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

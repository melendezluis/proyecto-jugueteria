import Link from 'next/link';

export default function EnvioExpressPage() {
  return (
    <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border-t-4 border-[#6EBA92] p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">🚚</span>
          <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-[#2B2D42] tracking-wide">
            Envío Express
          </h1>
          <p className="text-[#2B2D42]/60 mt-2">Entrega el mismo día en Chancay</p>
        </div>

        <div className="space-y-6 text-[#2B2D42]/90 font-nunito leading-relaxed">
          <div className="bg-[#B7E4C7] rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">👀</span>
            <p>
              Pide antes de las <strong>3pm</strong> de lunes a viernes y
              asegúrate de tener el producto el mismo día <strong>🚚</strong>
            </p>
          </div>

          <div className="bg-[#BDE0FE] rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">📍</span>
            <div>
              <p className="font-semibold mb-1">Zona de Cobertura:</p>
              <p>
                Centro de Chancay, Peralvillo, Chancayllo, Pampa Libre / Candelaria, Quepe Pampa, Buena Vista,
                Zona portuaria y áreas logísticas.
              </p>
            </div>
          </div>

          <div className="bg-[#FFC8DD] rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">👉</span>
            <p>
              Válido solo para productos con la etiqueta de envío express
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#5EA57E] hover:bg-[#4E8A68] text-white font-semibold px-8 py-3 rounded-full transition-all active:scale-95 shadow-md"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
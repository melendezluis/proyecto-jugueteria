import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#2B2D42]/10 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="font-fredoka text-7xl font-bold text-[#5EA57E]">404</p>
        <h1 className="mt-3 font-fredoka text-2xl font-bold text-[#2B2D42] sm:text-3xl">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#2B2D42]/65">
          La página que buscas no existe o cambió de dirección. Puedes volver al
          inicio o revisar nuestras secciones de ayuda.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#5EA57E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4E8A68]"
          >
            Volver al inicio
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center rounded-xl border-2 border-[#2B2D42]/15 px-6 py-3 text-sm font-bold text-[#2B2D42]/70 transition-colors hover:border-[#2B2D42]/30"
          >
            Contactarnos
          </Link>
        </div>
      </div>
    </div>
  );
}

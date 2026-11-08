import Link from 'next/link';
import type { ReactNode } from 'react';

type LegalPageProps = {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: ReactNode;
};

export default function LegalPage({
  title,
  subtitle,
  updatedAt,
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#FFFAF5] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B2D42]/60 transition-colors hover:text-[#2B2D42]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Volver a la tienda
        </Link>

        <article className="mt-5 overflow-hidden rounded-3xl border border-[#2B2D42]/10 bg-white shadow-sm">
          <header className="border-b border-[#2B2D42]/10 bg-gradient-to-br from-[#2B2D42] via-[#343752] to-[#3F7357] px-6 py-10 text-white sm:px-10">
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#FFD23F]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m0 12.75h7.5m-7.5 3h7.5M7.5 2.25H5.625A1.875 1.875 0 0 0 3.75 4.125v15.75A1.875 1.875 0 0 0 5.625 21.75h12.75a1.875 1.875 0 0 0 1.875-1.875V9.75a3 3 0 0 0-3-3h-2.25A3.375 3.375 0 0 1 11.625 3.375V2.25Z"
                />
              </svg>
            </span>
            <h1 className="font-fredoka text-3xl font-bold tracking-wide sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                {subtitle}
              </p>
            )}
            {updatedAt && (
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#FFD23F]">
                Última actualización: {updatedAt}
              </p>
            )}
          </header>

          <div className="legal-content px-6 py-8 sm:px-10 sm:py-10">
            {children}
          </div>
        </article>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#2B2D42]/10 bg-white px-5 py-4 text-center text-sm sm:flex-row sm:text-left">
          <p className="text-[#2B2D42]/65">
            ¿Tienes dudas sobre esta información?
          </p>
          <Link
            href="/contacto"
            className="font-semibold text-[#1B66D0] hover:underline"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  );
}

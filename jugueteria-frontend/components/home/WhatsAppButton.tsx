'use client';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
const MESSAGE = encodeURIComponent('¡Hola! Quisiera información sobre sus juguetes 🧸');

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 -z-10" />
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white" aria-hidden="true">
        <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.594 4.466 1.72 6.41L3.2 28.8l6.55-1.715a12.74 12.74 0 0 0 6.254 1.635h.006c7.058 0 12.8-5.74 12.8-12.8s-5.742-12.72-12.806-12.72zm0 23.394h-.005a10.62 10.62 0 0 1-5.408-1.481l-.388-.23-3.887 1.018 1.038-3.789-.253-.389a10.604 10.604 0 0 1-1.629-5.663c0-5.867 4.775-10.64 10.646-10.64 2.843 0 5.514 1.108 7.523 3.118a9.982 9.982 0 0 1 3.116 7.526c-.002 5.867-4.777 10.54-10.753 10.54zm5.836-7.963c-.32-.16-2.02-.997-2.333-1.11-.313-.115-.54-.172-.768.17-.227.32-.882 1.111-1.081 1.34-.199.228-.398.256-.718.086-.32-.16-1.357-.5-2.583-1.595-.955-.851-1.6-1.903-1.788-2.223-.198-.32-.02-.494.141-.653.144-.143.32-.371.479-.557.16-.186.213-.32.32-.533.107-.214.053-.4-.027-.557-.08-.16-.719-1.732-.985-2.372-.26-.623-.524-.539-.719-.548l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.119 1.094-1.119 2.665s1.146 3.09 1.306 3.303c.16.213 2.252 3.44 5.455 4.824.762.33 1.358.526 1.822.673.766.244 1.463.209 2.014.127.614-.092 1.892-.773 2.158-1.52.266-.745.266-1.384.186-1.518-.079-.133-.292-.213-.612-.372z" />
      </svg>
    </a>
  );
}

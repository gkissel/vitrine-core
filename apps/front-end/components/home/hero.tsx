"use client";

import Image from "next/image";
import Link from "next/link";
import Fundo from "public/images/fundo1.png";

export function Hero() {
  return (
    <>
      {/* Hero section */}
      <div className="relative bg-gray-900 h-[80vh] min-h-[600px] flex items-center mx-2 rounded-xl overflow-hidden">
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <Image
            src={Fundo}
            alt="Plantação de erva mate"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-6 lg:px-8">
          <span className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
            DIRETO DO SUL DO BRASIL
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white lg:text-7xl max-w-3xl leading-tight">
            Erva Mate Para o Brasil
          </h1>
          <p className="mt-6 text-lg text-gray-200 max-w-2xl">
            A erva mate mais pura, colhida à mão nas regiões serranas do sul.
            Tradição gaúcha que atravessa gerações, agora disponível em todo o
            país.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/products"
              className="inline-flex rounded-md border border-transparent bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              Ver nossos produtos
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-md border-2 border-white px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              Contato
            </Link>
          </div>
        </div>

        {/* Highlight overlapping block bottom right */}
        <div className="absolute bottom-0 right-0 hidden lg:block max-w-sm bg-black/60 p-8 backdrop-blur-sm text-white">
          <p className="text-sm text-gray-300">
            Cultivada com cuidado, "com orgulho entregue" para todo o Brasil.
          </p>
        </div>
      </div>
    </>
  );
}

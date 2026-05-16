"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface MasonryFeaturesProps {
  title: ReactNode;
}

const carouselSlides = [
  { src: "/images/carousel1.png", alt: "Carrossel de imagens 1" },
  { src: "/images/carousel2.png", alt: "Carrossel de imagens 2" },
  { src: "/images/carousel3.png", alt: "Carrossel de imagens 3" },
  { src: "/images/carousel4.png", alt: "Carrossel de imagens 4" },
  { src: "/images/carousel5.png", alt: "Carrossel de imagens 5" },
];

const sizeClasses = [
  "w-28 sm:w-32 lg:w-36 aspect-[3/5]",
  "w-36 sm:w-40 lg:w-44 h-[300px]",
  "w-36 sm:w-40 lg:w-44 h-[400px] -translate-y-2 sm:-translate-y-3",
  "w-36 sm:w-40 lg:w-44 h-[300px]",
  "w-28 sm:w-32 lg:w-36 aspect-[3/5]",
];

export function MasonryFeatures({ title }: MasonryFeaturesProps) {
  return (
    <section className="overflow-hidden bg-white pt-16 pb-8 sm:pt-24 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className=" flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
          <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-green-900 md:text-4xl lg:text-5xl">
            {title}
          </h2>
          <Link
            href="/marcas"
            className="inline-flex whitespace-nowrap rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            Conheça nossas marcas
            <ArrowUpRight className="ml-2 mt-0.5 w-4 h-4 " />
          </Link>
        </div>

        <div className=" flex w-full justify-center overflow-hidden">
          <div className="flex w-max origin-center scale-[0.48] items-center justify-center gap-2 sm:scale-100 sm:gap-4 lg:gap-5">
            {carouselSlides.map((slide, index) => {
              return (
                <div
                  key={slide.alt}
                  className={`group relative shrink-0 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_30px_rgba(16,24,40,0.08)] ring-1 ring-black/5 ${sizeClasses[index] ?? sizeClasses[0]}`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1024px) 10rem, (min-width: 640px) 9rem, 8rem"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/12 via-transparent to-transparent" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

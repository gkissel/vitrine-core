// storefront/components/about/about-mission.tsx
import Image from "next/image";

const stats = [
  { label: "Products shipped to date", value: "12,000+" },
  { label: "Countries we deliver to", value: "42" },
  { label: "5-star customer reviews", value: "4,800+" },
];

export function AboutMission() {
  return (
    <>
      {/* Mission section */}
      <div className="mx-auto -mt-12 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <h2 className="text-4xl font-semibold text-pretty text-gray-900 sm:text-5xl text-center">
            Nossa História, Sua Tradição.
          </h2>
          <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
            <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
              <p className="text-xl/8 text-gray-600">
                A Erva Mate Para o Brasil nasceu do amor pelo chimarrão gaúcho.
                Colhida à mão nas serras do sul, levamos pureza e tradição para
                todo o país, de norte a sul, estamos comprometidos em oferecer
                produtos de alta qualidade a preços acessíveis, sem comprometer
                o design ou a experiência do cliente. Nossa missão é criar
                produtos que nossos clientes amem e que tragam valor a sua vida
                diária.
              </p>
            </div>
            <div className="lg:flex lg:flex-auto lg:justify-center">
              <Image
                alt="Product screenshot"
                src="/images/image-about.png"
                width={350}
                height={408}
                className="w-full max-w-md rounded-md object-cover lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

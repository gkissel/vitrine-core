// storefront/components/about/about-team.tsx
import Image from "next/image";
import Logo from "components/logo";
import Name from "components/name";
import AboutFAQ from "./about-faq";

const team = {
  name: "Alex Rivera",
  role: "Sócio Fundador",
  imageUrl:
    "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80",
};
export function AboutTeam() {
  return (
    <>
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-48 lg:px-8">
        <div className="mx-auto mt-20 max-w-2xl  gap-x-8 gap-y-16 text-center lg:mx-0 lg:max-w-none ">
          <div className="flex items-center gap-4">
            <Image
              alt={team.name}
              src={team.imageUrl}
              width={96}
              height={96}
              className="size-16 rounded-full outline -outline-offset-1 outline-black/5"
            />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                {team.name}
              </h3>
              <p className="text-sm text-gray-500">{team.role}</p>
            </div>
          </div>
        </div>
      </div>

      <AboutFAQ />
    </>
  );
}

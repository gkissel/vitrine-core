import Logo from "../logo";
import Name from "../name";

// storefront/components/about/about-values.tsx

export function AboutValues() {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0 flex gap-4">
        <Logo width={40} height={40} className="h-18 w-auto" />
        <Name width={85} height={29} className="h-18 w-auto" />
      </div>
      <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 text-base/7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        <p>
          A Erva Mate Para o Brasil nasceu nas serras gaúchas, onde o chimarrão
          é mais do que uma bebida — é um ritual de encontro e partilha. Cada
          folha é colhida à mão por produtores que dedicam suas vidas a
          preservar a qualidade e a tradição dessa cultura única. Trabalhamos
          diretamente com famílias do sul do Brasil, garantindo rastreabilidade,
          respeito ao meio ambiente e um produto que chega até você com toda a
          sua essência preservada. Acreditamos que a erva mate merece ocupar um
          lugar de orgulho na mesa de todo brasileiro.
        </p>
        <p>
          Nossa missão é simples: levar a melhor erva mate do sul para todo o
          Brasil, sem abrir mão da qualidade e da autenticidade. Cada pacote que
          sai daqui carrega o cuidado de quem planta, colhe e processa com amor.
          Investimos em processos sustentáveis, embalagens que preservam o
          frescor e uma cadeia justa para todos os envolvidos. Seja para o
          chimarrão da manhã, o tererê da tarde ou um presente especial,
          queremos fazer parte dos seus melhores momentos com sabor e tradição
          de verdade.
        </p>
      </div>
    </div>
  );
}

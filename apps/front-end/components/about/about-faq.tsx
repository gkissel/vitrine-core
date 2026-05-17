import React from "react";

const faqs = [
  {
    q: "Como funciona a plataforma?",
    a: "Nossa plataforma conecta vendedores e compradores, oferecendo catálogo, carrinho e checkout integrado. Tudo pensado para performance e experiência do usuário.",
  },
  {
    q: "Quais problemas vocês podem me solucionar?",
    a: "Ajudamos com integração de catálogos, otimização de performance, soluções de pagamento e logística para e‑commerce.",
  },
  {
    q: "Quais são os preços?",
    a: "Oferecemos planos flexíveis conforme volume e funcionalidades. Entre em contato para um orçamento personalizado.",
  },
  {
    q: "Qual o tempo médio para implementar?",
    a: "Depende do escopo — uma loja básica pode ir ao ar em semanas; integrações complexas demandam mais tempo.",
  },
];

export function AboutFAQ() {
  return (
    <section className="mx-auto mt-20 max-w-2xl px-6 lg:mt-16">
      <div className="flex items-start gap-4">
        <span className="block h-10 w-1 rounded bg-brand" aria-hidden="true" />
        <h2 className="text-4xl font-semibold text-gray-900">
          Ficou com alguma dúvida?
        </h2>
      </div>

      <div className="mt-10 space-y-4">
        {faqs.map((item, idx) => (
          <details key={idx} className="group py-4" aria-expanded={false}>
            <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
              <span className="text-lg font-semibold text-gray-900">
                {item.q}
              </span>
              <svg
                className="h-10 w-10 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-3 text-sm text-gray-600">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default AboutFAQ;

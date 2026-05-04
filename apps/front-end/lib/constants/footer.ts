type FooterLink = { name: string; href: string };

type FooterConfig = {
  company: FooterLink[];
  legal: FooterLink[];
};

export const FOOTER_CONFIG: FooterConfig = {
  company: [
    { name: "Sobre", href: "/about" },
    { name: "Contato", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Política de Privacidade", href: "/privacy-policy" },
    { name: "Termos de Serviço", href: "/terms-of-service" },
    { name: "Política de Devolução", href: "/return-policy" },
    { name: "Política de Envio", href: "/shipping-policy" },
    { name: "Política de Cookies", href: "/cookie-policy" },
  ],
};

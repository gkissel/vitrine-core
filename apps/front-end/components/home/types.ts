export interface AvailableColor {
  name: string;
  colorBg: string;
}

export interface Product {
  id: number;
  name: string;
  color: string;
  price: string;
  variantId?: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  description?: string;
  availableForSale?: boolean;
  availableColors: AvailableColor[];
}

export interface Collection {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

export interface ProductIdentifier {
  SKU: string;
  EAN: string | null;
  description: string;
}

export const EVEN_QUANTITY_PRODUCT: ProductIdentifier = {
  SKU: "012139",
  EAN: null,
  description: "RESTYLANE SB VITAL LIDO 1ml"
};

export const EVEN_QUANTITY_GROUP_PRODUCTS: ProductIdentifier[] = [
  { SKU: "012132", EAN: null, description: "RESTYLANE VOLYME 1ml" },
  { SKU: "011594", EAN: null, description: "RESTYLANE REFYNE 1ml New" },
  { SKU: "012130", EAN: null, description: "REST LYFT LIDO 1ml" },
  { SKU: "012126", EAN: null, description: "RESTYLANE LIDOCAINA 1ml" },
  { SKU: "011596", EAN: null, description: "RESTYLANE KYSSE 1ml" },
  { SKU: "012134", EAN: null, description: "RESTYLANE DEFYNE 1ml" }
];

export const matchesProductIdentifier = (
  product: { SKU?: string; EAN?: string | null },
  identifier: ProductIdentifier
): boolean => {
  if (identifier.EAN && product.EAN && identifier.EAN === product.EAN) return true;
  return !!product.SKU && product.SKU === identifier.SKU;
};

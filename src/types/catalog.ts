export type CatalogCategory = {
  id: number;
  name: string;
};

export type CatalogProduct = {
  id: number;
  name: string;
  category_id: number;
};

export type CatalogItem = {
  id: number;
  name: string;
  sku: string | null;
  pack_size: string | null;
  unit_price: number | null;
  case_price: number | null;
  per_unit_price: number | null;
  active: boolean;
  product_id: number;
};

export type CatalogProductWithItems = CatalogProduct & {
  items: CatalogItem[];
};

export type CatalogCategoryWithProducts = CatalogCategory & {
  products: CatalogProductWithItems[];
};

export type OrderMap = Record<number, number>;

export type OrderReviewState = {
  order: OrderMap;
  categories: CatalogCategoryWithProducts[];
};

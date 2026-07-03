import { supabase } from '../supabaseClient';
import type {
  CatalogCategory,
  CatalogCategoryWithProducts,
  CatalogItem,
  CatalogProduct,
} from '../types/catalog';

const CATEGORY_TREE_SELECT =
  'id,name,products(id,name,category_id,items(id,name,sku,pack_size,unit_price,case_price,per_unit_price,active,product_id))';

export async function fetchCatalogTree(): Promise<CatalogCategoryWithProducts[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_TREE_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as CatalogCategoryWithProducts[]) ?? [];
}

export async function fetchAdminCatalogData(): Promise<{
  categories: CatalogCategory[];
  products: CatalogProduct[];
  items: CatalogItem[];
}> {
  const [cats, prods, itms] = await Promise.all([
    supabase.from('categories').select('*').order('id'),
    supabase.from('products').select('*').order('id'),
    supabase.from('items').select('*').order('id'),
  ]);

  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  if (itms.error) throw itms.error;

  return {
    categories: (cats.data as CatalogCategory[]) ?? [],
    products: (prods.data as CatalogProduct[]) ?? [],
    items: (itms.data as CatalogItem[]) ?? [],
  };
}

export async function createCategory(name: string): Promise<CatalogCategory> {
  const { data, error } = await supabase.from('categories').insert([{ name }]).select().single();
  if (error) throw error;
  return data as CatalogCategory;
}

export async function createProduct(name: string, categoryId: number): Promise<CatalogProduct> {
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, category_id: categoryId }])
    .select()
    .single();
  if (error) throw error;
  return data as CatalogProduct;
}

export type CreateItemInput = {
  product_id: number;
  name: string;
  sku?: string;
  pack_size?: string;
  unit_price?: number;
  case_price?: number;
  per_unit_price?: number;
};

export async function createItem(input: CreateItemInput): Promise<CatalogItem> {
  const payload = {
    product_id: input.product_id,
    name: input.name,
    sku: input.sku || null,
    pack_size: input.pack_size || null,
    unit_price: Number.isFinite(input.unit_price) ? input.unit_price : null,
    case_price: Number.isFinite(input.case_price) ? input.case_price : null,
    per_unit_price: Number.isFinite(input.per_unit_price) ? input.per_unit_price : null,
  };

  const { data, error } = await supabase.from('items').insert([payload]).select().single();
  if (error) throw error;
  return data as CatalogItem;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: number): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export interface Item<T extends string | number> {
  id: T;
  label: string;
}

export interface Category extends Item<string> {
  type?: 'product' | 'category' | 'brand' | 'deal' | 'trending' | 'new-arrival';
  metadata?: Record<string, any>;
  children?: Category[];
}

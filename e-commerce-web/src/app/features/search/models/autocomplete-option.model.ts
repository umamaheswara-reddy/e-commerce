export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export interface CategoryDropdownItem {
  id: string;
  name: string;
}

export interface AutocompleteOption {
  id: string;
  label: string;
  type: 'product' | 'category' | 'brand' | 'deal' | 'trending' | 'new-arrival';
  metadata?: Record<string, any>;
  categories?: Category[];
}

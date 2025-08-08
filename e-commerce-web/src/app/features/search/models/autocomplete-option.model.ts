export interface AutocompleteOption {
  id: string;
  name: string;
  children?: AutocompleteOption[];
}

export interface CategoryDropdownItem {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  label: string;
  type: 'product' | 'category' | 'brand' | 'deal' | 'trending' | 'new-arrival';
  metadata?: Record<string, any>;
  categories?: AutocompleteOption[];
}

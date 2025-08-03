export interface AutocompleteOption {
  id: string;
  label: string;
  type: 'product' | 'category' | 'brand' | 'deal' | 'trending' | 'new-arrival';
  metadata?: Record<string, any>;
}

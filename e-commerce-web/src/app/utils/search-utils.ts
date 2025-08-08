// src/app/utils/search-utils.ts

import {
  AutocompleteOption,
  Category,
} from '../features/search/models/autocomplete-option.model';

/** Checks if an option matches a search term in its label or nested categories */
export function optionMatchesTerm(category: Category, term: string): boolean {
  const normalized = term.toLowerCase();
  if (category.label.toLowerCase().includes(normalized)) {
    return true;
  }
  return (
    !!category.categories && searchInCategories(category.categories, normalized)
  );
}

/** Checks if an option belongs to a specific category id */
export function optionMatchesCategory(
  category: Category,
  categoryId: string
): boolean {
  if (!category.categories) return false;
  return categoryTreeContainsId(category.categories, categoryId);
}

/** Recursively searches categories for a term */
export function searchInCategories(
  categories: AutocompleteOption[],
  term: string
): boolean {
  for (const category of categories) {
    if (category.name.toLowerCase().includes(term)) {
      return true;
    }
    if (category.children && searchInCategories(category.children, term)) {
      return true;
    }
  }
  return false;
}

/** Recursively checks if a category tree contains a specific id */
export function categoryTreeContainsId(
  categories: AutocompleteOption[],
  id: string
): boolean {
  for (const category of categories) {
    if (category.id === id) {
      return true;
    }
    if (category.children && categoryTreeContainsId(category.children, id)) {
      return true;
    }
  }
  return false;
}

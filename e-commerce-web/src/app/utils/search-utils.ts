// src/app/utils/search-utils.ts

import {
  Category,
  EntityType,
  SearchEntity,
} from '../features/search/models/entity.models';

/** Checks if an option matches a search term in its label or nested categories */
export function optionMatchesTerm(
  searchEntity: SearchEntity,
  term: string
): boolean {
  const normalized = term.toLowerCase();

  // Direct label match
  if (searchEntity.label.toLowerCase().includes(normalized)) {
    return true;
  }

  // If it's a category, search children recursively
  if (searchEntity.type === EntityType.Category && searchEntity.children) {
    return searchInCategories(searchEntity.children, normalized);
  }

  return false;
}

/** Checks if an option belongs to a specific category id */
export function optionMatchesCategory(
  searchEntity: SearchEntity,
  categoryId: string
): boolean {
  // For categories, check the category tree
  if (searchEntity.type === EntityType.Category && searchEntity.children) {
    return categoryTreeContainsId(searchEntity.children, categoryId);
  }

  // For products, check if metadata has categoryId
  if (searchEntity.type === EntityType.Product && searchEntity.categoryId) {
    return searchEntity.categoryId === categoryId;
  }

  return false;
}

/** Recursively searches categories for a term */
export function searchInCategories(
  categories: Category[],
  term: string
): boolean {
  for (const category of categories) {
    if (category.label.toLowerCase().includes(term)) {
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
  categories: Category[],
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

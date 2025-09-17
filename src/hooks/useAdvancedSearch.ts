import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/types';

export interface FilterCriteria {
  search?: string;
  category?: string;
  priceRange?: [number, number];
  sizes?: string[];
  inStock?: boolean;
  rating?: number;
  tags?: string[];
  brand?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    sizes: { name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
    brands: { name: string; count: number }[];
  };
  searchMetrics: {
    searchTime: number;
    suggestion?: string;
  };
}

// Advanced search utility functions
export const searchUtils = {
  // Fuzzy string matching
  fuzzyMatch: (text: string, search: string, threshold = 0.6): boolean => {
    if (!search) return true;
    
    const textLower = text.toLowerCase();
    const searchLower = search.toLowerCase();
    
    // Exact match
    if (textLower.includes(searchLower)) return true;
    
    // Character-based fuzzy matching
    let searchIndex = 0;
    let matchedChars = 0;
    
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        matchedChars++;
        searchIndex++;
      }
    }
    
    return (matchedChars / searchLower.length) >= threshold;
  },

  // Calculate relevance score
  calculateRelevance: (product: Product, search: string): number => {
    if (!search) return 1;
    
    const searchLower = search.toLowerCase();
    let score = 0;
    
    // Name match (highest priority)
    if (product.name.toLowerCase().includes(searchLower)) {
      score += 10;
      if (product.name.toLowerCase().startsWith(searchLower)) {
        score += 5;
      }
    }
    
    // Category match
    if (product.category.toLowerCase().includes(searchLower)) {
      score += 5;
    }
    
    // Description match
    if (product.description.toLowerCase().includes(searchLower)) {
      score += 2;
    }
    
    // Size match
    if (product.sizes.some(size => size.toLowerCase().includes(searchLower))) {
      score += 1;
    }
    
    return score;
  },

  // Generate search suggestions
  generateSuggestions: (search: string, products: Product[]): string[] => {
    if (!search || search.length < 2) return [];
    
    const suggestions = new Set<string>();
    const searchLower = search.toLowerCase();
    
    products.forEach(product => {
      // Name suggestions
      if (product.name.toLowerCase().includes(searchLower)) {
        suggestions.add(product.name);
      }
      
      // Category suggestions
      if (product.category.toLowerCase().includes(searchLower)) {
        suggestions.add(product.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }
};

// Main search and filter hook
export function useProductSearch(
  products: Product[],
  initialFilters: FilterCriteria = {}
) {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search to avoid too many re-renders
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Main search and filter logic
  const searchResult = useMemo((): SearchResult => {
    const startTime = performance.now();
    
    let filteredProducts = [...products];
    
    // Text search with fuzzy matching
    if (debouncedSearch) {
      filteredProducts = filteredProducts
        .map(product => ({
          product,
          relevance: searchUtils.calculateRelevance(product, debouncedSearch)
        }))
        .filter(({ product, relevance }) => 
          relevance > 0 || 
          searchUtils.fuzzyMatch(product.name, debouncedSearch) ||
          searchUtils.fuzzyMatch(product.description, debouncedSearch) ||
          searchUtils.fuzzyMatch(product.category, debouncedSearch)
        )
        .sort((a, b) => b.relevance - a.relevance)
        .map(({ product }) => product);
    }
    
    // Category filter
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    
    // Price range filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      filteredProducts = filteredProducts.filter(
        product => product.price >= minPrice && product.price <= maxPrice
      );
    }
    
    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(
        product => filters.sizes!.some(size => product.sizes.includes(size))
      );
    }
    
    // Stock filter
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(
        product => product.inStock === filters.inStock
      );
    }
    
    // Brand filter
    if (filters.brand) {
      // Assuming brand is part of product name or description
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(filters.brand!.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.brand!.toLowerCase())
      );
    }
    
    // Sorting
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'newest':
            // Assuming products have a date field or use id as proxy
            comparison = a.id - b.id;
            break;
          case 'popular':
            // Could be based on sales, views, etc. Using price as proxy
            comparison = b.price - a.price;
            break;
          default:
            comparison = 0;
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    
    // Generate facets for filtered results
    const facets = {
      categories: [...new Set(filteredProducts.map(p => p.category))]
        .map(category => ({
          name: category,
          count: filteredProducts.filter(p => p.category === category).length
        })),
      
      sizes: [...new Set(filteredProducts.flatMap(p => p.sizes))]
        .map(size => ({
          name: size,
          count: filteredProducts.filter(p => p.sizes.includes(size)).length
        })),
      
      priceRanges: [
        { min: 0, max: 50, count: filteredProducts.filter(p => p.price <= 50).length },
        { min: 50, max: 100, count: filteredProducts.filter(p => p.price > 50 && p.price <= 100).length },
        { min: 100, max: 200, count: filteredProducts.filter(p => p.price > 100 && p.price <= 200).length },
        { min: 200, max: Infinity, count: filteredProducts.filter(p => p.price > 200).length },
      ].filter(range => range.count > 0),
      
      brands: [...new Set(filteredProducts.map(p => p.name.split(' ')[0]))]
        .map(brand => ({
          name: brand,
          count: filteredProducts.filter(p => p.name.startsWith(brand)).length
        }))
    };
    
    const searchTime = performance.now() - startTime;
    const suggestion = debouncedSearch ? 
      searchUtils.generateSuggestions(debouncedSearch, products)[0] : undefined;
    
    return {
      products: filteredProducts,
      totalCount: filteredProducts.length,
      facets,
      searchMetrics: {
        searchTime,
        suggestion: suggestion !== debouncedSearch ? suggestion : undefined
      }
    };
  }, [products, filters, debouncedSearch]);

  // Filter management functions
  const updateFilter = useCallback(<K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const resetSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  const applyFilters = useCallback((newFilters: Partial<FilterCriteria>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Batch operations for performance
  const batchUpdateFilters = useCallback((updates: Partial<FilterCriteria>[]) => {
    setIsLoading(true);
    
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      const mergedUpdate = updates.reduce((acc, update) => ({ ...acc, ...update }), {});
      setFilters(prev => ({ ...prev, ...mergedUpdate }));
      setIsLoading(false);
    });
  }, []);

  return {
    filters,
    searchResult,
    isLoading,
    updateFilter,
    clearFilters,
    resetSearch,
    applyFilters,
    batchUpdateFilters,
    
    // Convenience getters
    get filteredProducts() { return searchResult.products; },
    get totalCount() { return searchResult.totalCount; },
    get facets() { return searchResult.facets; },
    get searchMetrics() { return searchResult.searchMetrics; },
    get hasActiveFilters() { 
      return Object.keys(filters).some(key => {
        const value = filters[key as keyof FilterCriteria];
        return value !== undefined && value !== '' && 
               (Array.isArray(value) ? value.length > 0 : true);
      });
    }
  };
}

// Advanced search component props interface
export interface AdvancedSearchProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  facets: SearchResult['facets'];
  currentFilters: FilterCriteria;
  searchMetrics: SearchResult['searchMetrics'];
  suggestions?: string[];
}

// Helper hook for search history and recent searches
export function useSearchHistory(maxHistory = 10) {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((search: string) => {
    if (!search.trim()) return;
    
    setSearchHistory(prev => {
      const newHistory = [search, ...prev.filter(item => item !== search)];
      const limitedHistory = newHistory.slice(0, maxHistory);
      
      try {
        localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
      } catch {
        // Handle localStorage errors silently
      }
      
      return limitedHistory;
    });
  }, [maxHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch {
      // Handle localStorage errors silently
    }
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
}
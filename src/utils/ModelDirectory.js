export class ModelDirectory {
  constructor(models) {
    this.allModels = models || [];
    this.filteredModels = [...this.allModels];
    this.filters = {
      pipeline: '',
      family: '',
      architecture: '',
      weight: '',
      safetensorMin: '',
      safetensorMax: ''
    };
    this.searchQuery = '';
    this.searchMode = 'middle'; // 'start' or 'middle'
    this.sortBy = 'name_asc'; // 'name_asc', 'name_desc', 'safetensor_asc', 'safetensor_desc'
  }

  setModels(models) {
    this.allModels = models || [];
    this.applyAll();
  }

  setSearch(query, mode = 'middle') {
    this.searchQuery = query.toLowerCase();
    this.searchMode = mode;
    this.applyAll();
  }

  setFilter(key, value) {
    this.filters[key] = value;
    this.applyAll();
  }
  
  clearFilters() {
    this.filters = {
      pipeline: '',
      family: '',
      architecture: '',
      weight: '',
      safetensorMin: '',
      safetensorMax: ''
    };
    this.searchQuery = '';
    this.applyAll();
  }

  setSort(sortBy) {
    this.sortBy = sortBy;
    this.applyAll();
  }

  applyAll() {
    let result = [...this.allModels];

    // 1. Filter by Search Query
    if (this.searchQuery) {
      result = result.filter(model => {
        const name = (model.display_name || '').toLowerCase();
        const family = (model.family || '').toLowerCase();
        
        if (this.searchMode === 'start') {
          return name.startsWith(this.searchQuery) || family.startsWith(this.searchQuery);
        } else {
          // middle / substring
          return name.includes(this.searchQuery) || family.includes(this.searchQuery);
        }
      });
    }

    // 2. Apply Filters
    if (this.filters.pipeline) {
      result = result.filter(m => m.hf_tags?.pipeline_tag === this.filters.pipeline);
    }
    if (this.filters.family) {
      result = result.filter(m => m.family === this.filters.family);
    }
    if (this.filters.architecture) {
      result = result.filter(m => m.architecture_category === this.filters.architecture);
    }
    if (this.filters.weight) {
      result = result.filter(m => m.weight_format === this.filters.weight);
    }
    if (this.filters.safetensorMin !== '') {
      result = result.filter(m => parseInt(m.safetensor_file_count || '0') >= parseInt(this.filters.safetensorMin));
    }
    if (this.filters.safetensorMax !== '') {
      result = result.filter(m => parseInt(m.safetensor_file_count || '0') <= parseInt(this.filters.safetensorMax));
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
      const countA = parseInt(a.safetensor_file_count || '0');
      const countB = parseInt(b.safetensor_file_count || '0');
      const nameA = (a.display_name || '').toLowerCase();
      const nameB = (b.display_name || '').toLowerCase();

      switch (this.sortBy) {
        case 'safetensor_asc':
          return countA - countB;
        case 'safetensor_desc':
          return countB - countA;
        case 'name_desc':
          return nameB.localeCompare(nameA);
        case 'name_asc':
        default:
          return nameA.localeCompare(nameB);
      }
    });

    this.filteredModels = result;
  }

  getResults() {
    return this.filteredModels;
  }
}

// Simple debounce utility function (as requested in the spec)
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Simple throttle utility function
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

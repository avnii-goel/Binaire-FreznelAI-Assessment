import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Flex, View, Heading, Text, TextField, Picker, Item, 
  Button, Grid, ProgressCircle, Divider, NumberField, ActionButton, RadioGroup, Radio 
} from '@adobe/react-spectrum';
import { fetchModels } from '../api/fetchModels';
import { ModelDirectory, debounce } from '../utils/ModelDirectory';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

const ModelSelection = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [directory] = useState(() => new ModelDirectory([]));
  const [searchInput, setSearchInput] = useState('');
  
  // Extract unique filter options
  const [filterOptions, setFilterOptions] = useState({
    pipelines: [],
    families: [],
    architectures: [],
    weights: []
  });

  useEffect(() => {
    fetchModels()
      .then(data => {
        const models = data.models || [];
        directory.setModels(models);
        setResults(directory.getResults());
        
        // Populate filter options dynamically based on available data
        const pipes = new Set();
        const fams = new Set();
        const archs = new Set();
        const wgts = new Set();
        
        models.forEach(m => {
          if (m.hf_tags?.pipeline_tag) pipes.add(m.hf_tags.pipeline_tag);
          if (m.family) fams.add(m.family);
          if (m.architecture_category) archs.add(m.architecture_category);
          if (m.weight_format) wgts.add(m.weight_format);
        });

        setFilterOptions({
          pipelines: Array.from(pipes),
          families: Array.from(fams),
          architectures: Array.from(archs),
          weights: Array.from(wgts)
        });
        
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [directory]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query, mode) => {
      directory.setSearch(query, mode);
      setResults(directory.getResults());
    }, 300),
    [directory]
  );

  const handleSearchChange = (val) => {
    setSearchInput(val);
    debouncedSearch(val, directory.searchMode);
  };

  const handleSearchModeChange = (mode) => {
    directory.setSearchMode = mode; // We will use directory.setSearch with the mode
    debouncedSearch(searchInput, mode);
  };

  const handleFilterChange = (key, val) => {
    directory.setFilter(key, val);
    setResults(directory.getResults());
  };

  const handleSortChange = (val) => {
    directory.setSort(val);
    setResults(directory.getResults());
  };

  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  if (loading) {
    return (
      <Flex alignItems="center" justifyContent="center" height="100vh">
        <ProgressCircle aria-label="Loading…" isIndeterminate size="L" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex alignItems="center" justifyContent="center" height="100vh" direction="column" gap="size-200">
        <Heading level={2} UNSAFE_style={{ color: 'var(--spectrum-global-color-red-500)' }}>Error Loading Data</Heading>
        <Text>{error}</Text>
      </Flex>
    );
  }

  return (
    <View UNSAFE_style={{ animation: 'fadeIn 0.6s ease-out', minHeight: '100vh', background: 'transparent' }} padding="size-400">
      <Flex justifyContent="space-between" alignItems="center" marginBottom="size-400">
        <Heading level={1} margin={0} UNSAFE_style={{ color: '#1f2937', letterSpacing: '-0.5px' }}>Model Directory</Heading>
        <Flex alignItems="center" gap="size-200">
          <Text UNSAFE_style={{ color: '#4b5563' }}>Signed in as: <span className="accent-text">{user?.email}</span></Text>
          <Button variant="secondary" style="outline" onPress={handleLogout}>Log Out</Button>
        </Flex>
      </Flex>
      <Divider size="M" marginBottom="size-400" />
      
      <Grid columns={['280px', '1fr']} gap="size-500">
        {/* Sidebar for Filters and Sort */}
        <View UNSAFE_className="glass-container" padding="size-300" borderRadius="medium">
          <Heading level={3} marginTop={0}>Filters & Sort</Heading>
          
          <Flex direction="column" gap="size-300">
            {/* Sorting */}
            <Picker label="Sort By" selectedKey={directory.sortBy} onSelectionChange={handleSortChange}>
              <Item key="name_asc">Model Name (A-Z)</Item>
              <Item key="name_desc">Model Name (Z-A)</Item>
              <Item key="safetensor_asc">Safetensor Files (Low to High)</Item>
              <Item key="safetensor_desc">Safetensor Files (High to Low)</Item>
            </Picker>

            <Divider size="S" />
            
            {/* Pipeline Filter */}
            <Picker label="Pipeline" selectedKey={directory.filters.pipeline} onSelectionChange={(k) => handleFilterChange('pipeline', k)}>
              <Item key="">Any</Item>
              {filterOptions.pipelines.map(p => <Item key={p}>{p}</Item>)}
            </Picker>

            {/* Family Filter */}
            <Picker label="Family" selectedKey={directory.filters.family} onSelectionChange={(k) => handleFilterChange('family', k)}>
              <Item key="">Any</Item>
              {filterOptions.families.map(f => <Item key={f}>{f}</Item>)}
            </Picker>

            {/* Architecture Filter */}
            <Picker label="Architecture" selectedKey={directory.filters.architecture} onSelectionChange={(k) => handleFilterChange('architecture', k)}>
              <Item key="">Any</Item>
              {filterOptions.architectures.map(a => <Item key={a}>{a}</Item>)}
            </Picker>

            {/* Weight Filter */}
            <Picker label="Weight Format" selectedKey={directory.filters.weight} onSelectionChange={(k) => handleFilterChange('weight', k)}>
              <Item key="">Any</Item>
              {filterOptions.weights.map(w => <Item key={w}>{w}</Item>)}
            </Picker>

            <Divider size="S" />
            <Text>Safetensor Files Count</Text>
            <Flex gap="size-100">
              <NumberField 
                label="Min" 
                labelPosition="side" 
                width="50%" 
                onChange={(val) => handleFilterChange('safetensorMin', val)} 
              />
              <NumberField 
                label="Max" 
                labelPosition="side" 
                width="50%" 
                onChange={(val) => handleFilterChange('safetensorMax', val)} 
              />
            </Flex>

            <Button variant="primary" isQuiet onPress={() => {
              directory.clearFilters();
              setSearchInput('');
              setResults(directory.getResults());
            }}>
              Clear All Filters
            </Button>
          </Flex>
        </View>

        {/* Main Content Area */}
        <View>
          <Flex direction="column" gap="size-400">
            {/* Search Bar */}
            <View UNSAFE_className="glass-container" padding="size-300" borderRadius="medium">
              <Flex gap="size-400" alignItems="end">
                <TextField 
                  label="Search Models (Name or Family)" 
                  width="100%" 
                  value={searchInput} 
                  onChange={handleSearchChange} 
                />
                <RadioGroup 
                  label="Match Type" 
                  orientation="horizontal" 
                  value={directory.searchMode} 
                  onChange={handleSearchModeChange}
                >
                  <Radio value="start">Starts With</Radio>
                  <Radio value="middle">Substring</Radio>
                </RadioGroup>
              </Flex>
            </View>

            {/* Results Grid */}
            <Text UNSAFE_style={{ color: '#4b5563', fontWeight: 500 }}>Showing {results.length} models</Text>
            <Grid columns="repeat(auto-fill, minmax(320px, 1fr))" gap="size-400">
              {results.map(model => (
                <View 
                  key={model.id} 
                  UNSAFE_className="model-card"
                  padding="size-300"
                >
                  <Flex direction="column" height="100%" justifyContent="space-between">
                    <View>
                      <Heading level={4} margin={0} marginBottom="size-100" UNSAFE_style={{ color: '#111827' }}>
                        {model.display_name || model.id}
                      </Heading>
                      <Text UNSAFE_style={{ color: '#6b7280', fontSize: '0.9rem' }} marginBottom="size-200">
                        {model.family} • {model.architecture_category}
                      </Text>
                    </View>
                    
                    <Flex direction="column" gap="size-150" marginTop="size-200">
                      <Flex alignItems="center" gap="size-100">
                        <span className="pill-tag">{model.hf_tags?.pipeline_tag || 'General'}</span>
                        <span className="pill-tag">{model.weight_format || 'N/A'}</span>
                      </Flex>
                      <Text size="S" UNSAFE_style={{ color: '#4b5563' }}>
                        <strong style={{ color: '#111827' }}>Safetensors:</strong> {model.safetensor_file_count || 0} files
                      </Text>
                    </Flex>
                  </Flex>
                </View>
              ))}
            </Grid>
            {results.length === 0 && (
              <Flex justifyContent="center" padding="size-600">
                <Text>No models match your search or filters.</Text>
              </Flex>
            )}
          </Flex>
        </View>
      </Grid>
    </View>
  );
};

export default ModelSelection;

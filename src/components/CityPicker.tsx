/**
 * CityPicker - Autocomplete city selection component
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { searchCities, type CityResult } from '../utils/geocoding';
import { theme } from '../theme/theme';

interface CityPickerProps {
  label: string;
  value: string;
  onChange: (city: CityResult | null) => void;
  placeholder?: string;
  error?: string;
}

export function CityPicker({
  label,
  value,
  onChange,
  placeholder = 'Search for a city...',
  error,
}: CityPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update search query when value prop changes externally
  useEffect(() => {
    if (!selectedCity && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Debounced city search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    // If the search query matches the selected city, don't search
    if (selectedCity && searchQuery === selectedCity.display_name) {
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const cityResults = await searchCities(searchQuery);
      setResults(cityResults);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCity]);

  const handleSelectCity = (city: CityResult) => {
    setSelectedCity(city);
    setSearchQuery(city.display_name);
    setShowResults(false);
    setResults([]);
    onChange(city);
  };

  const handleClear = () => {
    setSelectedCity(null);
    setSearchQuery('');
    setShowResults(false);
    setResults([]);
    onChange(null);
  };

  const renderCityItem = ({ item }: { item: CityResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectCity(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.resultCity}>{item.city}</Text>
      <Text style={styles.resultLocation}>
        {item.state ? `${item.state}, ` : ''}
        {item.country}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => {
            if (searchQuery.trim().length >= 2 && results.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={() => {
            // Delay hiding results to allow for item selection
            setTimeout(() => setShowResults(false), 200);
          }}
        />
        {selectedCity && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderCityItem}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}
      {showResults && !isSearching && results.length === 0 && searchQuery.trim().length >= 2 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No cities found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  clearButton: {
    position: 'absolute',
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  loadingContainer: {
    position: 'absolute',
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  resultsContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    ...theme.shadows.card,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  resultCity: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs / 2,
  },
  resultLocation: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  noResultsContainer: {
    marginTop: theme.spacing.xs,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  noResultsText: {
    ...theme.typography.bodySecondary,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});


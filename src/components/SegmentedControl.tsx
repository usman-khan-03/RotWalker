/**
 * SegmentedControl - Pill-shaped segmented control
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onSelect }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            index === selectedIndex && styles.segmentActive,
            index === 0 && styles.segmentFirst,
            index === options.length - 1 && styles.segmentLast,
          ]}
          onPress={() => onSelect(index)}
        >
          <Text
            style={[
              styles.segmentText,
              index === selectedIndex && styles.segmentTextActive,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.pill,
    padding: theme.spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.pill,
  },
  segmentFirst: {
    borderTopLeftRadius: theme.borderRadius.pill,
    borderBottomLeftRadius: theme.borderRadius.pill,
  },
  segmentLast: {
    borderTopRightRadius: theme.borderRadius.pill,
    borderBottomRightRadius: theme.borderRadius.pill,
  },
  segmentText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});


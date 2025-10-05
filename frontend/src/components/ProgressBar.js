import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const ProgressBar = ({ current, max, color = theme.colors.primary, showLabel = true, height = 8 }) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{Math.round(percentage)}%</Text>
          <Text style={styles.values}>{current} / {max}</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  values: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  track: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.borderRadius.round,
  },
});

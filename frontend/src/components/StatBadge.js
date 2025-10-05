import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export const StatBadge = ({ icon, value, label, color }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  content: {
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});

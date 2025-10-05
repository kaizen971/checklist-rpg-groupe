import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const AVATAR_STYLES = {
  default: { icon: 'sword', color: theme.colors.primary },
  warrior: { icon: 'shield', color: '#E74C3C' },
  mage: { icon: 'flash', color: '#9B59B6' },
  archer: { icon: 'arrow-forward', color: '#27AE60' },
  healer: { icon: 'medkit', color: '#3498DB' },
  rogue: { icon: 'eye', color: '#34495E' },
};

export const Avatar = ({ type = 'default', size = 60, level }) => {
  const avatarStyle = AVATAR_STYLES[type] || AVATAR_STYLES.default;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: avatarStyle.color }]}>
      <Ionicons name={avatarStyle.icon} size={size * 0.5} color="#FFFFFF" />
      {level && (
        <View style={styles.levelBadge}>
          <Ionicons name="star" size={12} color={theme.colors.background} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.round,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});

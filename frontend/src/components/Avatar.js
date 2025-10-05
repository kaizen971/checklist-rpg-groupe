import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const AVATAR_STYLES = {
  default: { emoji: '⚔️', color: theme.colors.primary },
  warrior: { emoji: '🗡️', color: '#E74C3C' },
  mage: { emoji: '🔮', color: '#9B59B6' },
  archer: { emoji: '🏹', color: '#27AE60' },
  healer: { emoji: '✨', color: '#3498DB' },
  rogue: { emoji: '🗡️', color: '#34495E' },
};

export const Avatar = ({ type = 'default', size = 60, level }) => {
  const avatarStyle = AVATAR_STYLES[type] || AVATAR_STYLES.default;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: avatarStyle.color }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{avatarStyle.emoji}</Text>
      {level && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
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
  emoji: {
    textAlign: 'center',
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
  levelText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
});

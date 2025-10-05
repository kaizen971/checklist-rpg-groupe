import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Animation d'entrée améliorée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulse pour les types importants
    if (['success', 'level', 'xp', 'gold'].includes(type)) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Animation de brillance
    Animated.timing(shineAnim, {
      toValue: 300,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-fermeture
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'xp':
        return '✨';
      case 'gold':
        return '💰';
      case 'level':
        return '⭐';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      case 'xp':
        return theme.colors.xp;
      case 'gold':
        return theme.colors.gold;
      case 'level':
        return theme.colors.level;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: Animated.multiply(scaleAnim, pulseAnim) }
          ],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleClose}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.shineOverlay,
            {
              transform: [{ translateX: shineAnim }],
            },
          ]}
        />
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.md,
    right: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 9999,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 28,
    marginRight: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

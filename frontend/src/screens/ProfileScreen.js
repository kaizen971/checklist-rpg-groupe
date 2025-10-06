import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, Card, Button, ProgressBar } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const xpNeededForNextLevel = user ? user.level * 100 : 100;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView}>
        <View style={styles.container}>
          {/* Profile Header */}
          <Card variant="elevated" style={styles.headerCard}>
            <View style={styles.avatarContainer}>
              <Avatar type={user?.avatar || 'default'} size={120} level={user?.level} />
            </View>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.guildId && (
              <View style={styles.guildRow}>
                <Ionicons name="shield" size={18} color={theme.colors.accent} />
                <Text style={styles.guild}> {user.guildId.name}</Text>
              </View>
            )}
          </Card>

          {/* Stats Card */}
          <Card>
            <Text style={globalStyles.subtitle}>Character Stats</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{user?.level || 1}</Text>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>XP Progress</Text>
              <ProgressBar
                current={user?.xp || 0}
                max={xpNeededForNextLevel}
                color={theme.colors.xp}
              />
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Gold</Text>
              <View style={styles.goldRow}>
                <Ionicons name="wallet" size={18} color={theme.colors.gold} />
                <Text style={styles.statValue}> {user?.gold || 0}</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Role</Text>
              <Text style={styles.statValue}>{user?.role || 'Member'}</Text>
            </View>
          </Card>

          {/* Inventory */}
          <Card>
            <Text style={globalStyles.subtitle}>Inventory</Text>
            {user?.inventory && user.inventory.length > 0 ? (
              user.inventory.map((item, index) => (
                <View key={index} style={styles.inventoryItem}>
                  <Text style={styles.itemName}>Item #{item.itemId}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              ))
            ) : (
              <Text style={globalStyles.textMuted}>No items yet</Text>
            )}
          </Card>

          {/* Skills */}
          <Card>
            <Text style={globalStyles.subtitle}>Skills</Text>
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>Skill #{skill.skillId}</Text>
                  <View style={styles.skillProgress}>
                    <ProgressBar
                      current={skill.level}
                      max={10}
                      color={theme.colors.primary}
                      showLabel={false}
                      height={6}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={globalStyles.textMuted}>No skills unlocked yet</Text>
            )}
          </Card>

          {/* Cosmetics */}
          <Card>
            <Text style={globalStyles.subtitle}>Cosmetics</Text>
            {user?.cosmetics && user.cosmetics.length > 0 ? (
              <View style={styles.cosmeticsContainer}>
                {user.cosmetics.map((cosmetic, index) => (
                  <View key={index} style={styles.cosmeticBadge}>
                    <Text style={styles.cosmeticText}>{cosmetic}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={globalStyles.textMuted}>No cosmetics unlocked yet</Text>
            )}
          </Card>

          {/* Account Info */}
          <Card>
            <Text style={globalStyles.subtitle}>Account Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </Card>

          {/* Actions */}
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  username: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  guildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  guild: {
    fontSize: theme.fontSize.md,
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  statLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  progressContainer: {
    marginTop: theme.spacing.md,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  itemQuantity: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  skillItem: {
    marginTop: theme.spacing.md,
  },
  skillName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  skillProgress: {
    marginTop: theme.spacing.xs,
  },
  cosmeticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  cosmeticBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  cosmeticText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});

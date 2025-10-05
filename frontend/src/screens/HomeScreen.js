import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Avatar, Card, StatBadge, ProgressBar } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import api from '../services/api';

export const HomeScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.guildId) {
        const tasksData = await api.getTasks({ guildId: user.guildId._id });
        setTasks(tasksData.slice(0, 5)); // Show only 5 recent tasks
      }
      if (user?._id) {
        const statsData = await api.getUserStats(user._id);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUser()]);
    setRefreshing(false);
  };

  const xpNeededForNextLevel = user ? user.level * 100 : 100;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.container}>
          {/* Hero Card */}
          <Card variant="elevated" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <Avatar type={user?.avatar || 'default'} size={80} level={user?.level} />
              <View style={styles.heroInfo}>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.role}>{user?.role || 'Adventurer'}</Text>
                {user?.guildId && (
                  <View style={styles.guildRow}>
                    <Ionicons name="shield" size={16} color={theme.colors.accent} />
                    <Text style={styles.guild}> {user.guildId.name}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatBadge icon="star" value={user?.level || 1} label="Level" color={theme.colors.level} />
              <StatBadge icon="sparkles" value={user?.xp || 0} label="XP" color={theme.colors.xp} />
              <StatBadge icon="wallet" value={user?.gold || 0} label="Gold" color={theme.colors.gold} />
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Level Progress</Text>
              <ProgressBar
                current={user?.xp || 0}
                max={xpNeededForNextLevel}
                color={theme.colors.xp}
              />
            </View>
          </Card>

          {/* Quick Stats */}
          {stats && (
            <Card>
              <Text style={globalStyles.subtitle}>Your Stats</Text>
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalTasks}</Text>
                  <Text style={styles.statLabel}>Tasks Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalXP}</Text>
                  <Text style={styles.statLabel}>Total XP Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalGold}</Text>
                  <Text style={styles.statLabel}>Total Gold</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Guild Section */}
          {user?.guildId ? (
            <Card onPress={() => navigation.navigate('GuildDetail', { guildId: user.guildId._id })}>
              <View style={globalStyles.rowBetween}>
                <View>
                  <Text style={globalStyles.subtitle}>{user.guildId.name}</Text>
                  <Text style={globalStyles.textSecondary}>
                    {user.guildId.members?.length || 0} members
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
              </View>
            </Card>
          ) : (
            <Card onPress={() => navigation.navigate('Guilds')}>
              <Text style={globalStyles.subtitle}>Join a Guild</Text>
              <Text style={globalStyles.textSecondary}>
                Team up with other adventurers to complete quests together
              </Text>
              <View style={styles.joinButtonRow}>
                <Text style={styles.joinButton}>Browse Guilds</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </View>
            </Card>
          )}

          {/* Recent Tasks */}
          {tasks.length > 0 && (
            <View>
              <View style={globalStyles.rowBetween}>
                <Text style={globalStyles.subtitle}>Recent Tasks</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                  <View style={styles.seeAllRow}>
                    <Text style={styles.seeAll}>See All</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
              {tasks.map((task) => (
                <Card key={task._id} style={styles.taskCard}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskFooter}>
                    <View style={globalStyles.row}>
                      <View style={styles.rewardRow}>
                        <Ionicons name="sparkles" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.reward}> {task.xpReward} XP</Text>
                      </View>
                      <View style={styles.rewardRow}>
                        <Ionicons name="wallet" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.reward}> {task.goldReward} Gold</Text>
                      </View>
                    </View>
                    <View style={[styles.typeBadge, styles[`${task.type}Badge`]]}>
                      <Text style={styles.typeText}>{task.type}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  heroCard: {
    marginBottom: theme.spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  heroInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  role: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  guildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  guild: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  progressSection: {
    marginTop: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  joinButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  joinButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  taskCard: {
    marginTop: theme.spacing.sm,
  },
  taskTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reward: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  dailyBadge: {
    backgroundColor: theme.colors.success + '40',
  },
  weeklyBadge: {
    backgroundColor: theme.colors.warning + '40',
  },
  monthlyBadge: {
    backgroundColor: theme.colors.danger + '40',
  },
  typeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
});

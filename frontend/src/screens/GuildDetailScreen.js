import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Avatar, Input } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import api from '../services/api';

export const GuildDetailScreen = ({ route }) => {
  const { guildId } = route.params;
  const { user, refreshUser } = useAuth();
  const [guild, setGuild] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [quests, setQuests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('daily');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGuildData();
  }, [guildId]);

  const loadGuildData = async () => {
    try {
      const [guildData, tasksData, questsData] = await Promise.all([
        api.getGuild(guildId),
        api.getTasks({ guildId }),
        api.getQuests({ guildId }),
      ]);
      setGuild(guildData);
      setTasks(tasksData);
      setQuests(questsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guild data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuildData();
    setRefreshing(false);
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    try {
      setCreating(true);
      const newTask = await api.createTask({
        title: taskTitle,
        description: taskDescription,
        type: taskType,
        guildId: guildId,
        createdBy: user._id,
        xpReward: taskType === 'daily' ? 10 : taskType === 'weekly' ? 50 : 100,
        goldReward: taskType === 'daily' ? 5 : taskType === 'weekly' ? 25 : 50,
      });
      setTasks([newTask, ...tasks]);
      setShowTaskForm(false);
      setTaskTitle('');
      setTaskDescription('');
      Alert.alert('Success', 'Task created successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await api.completeTask(taskId, user._id);
      Alert.alert(
        'Task Completed! 🎉',
        `You earned ${result.completion.xpGained} XP and ${result.completion.goldGained} Gold!`
      );
      await refreshUser();
      await loadGuildData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTask(taskId);
              setTasks(tasks.filter(t => t._id !== taskId));
              Alert.alert('Success', 'Task deleted');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (!guild) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.centerContent}>
          <Text style={globalStyles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.container}>
          {/* Guild Header */}
          <Card variant="elevated">
            <Text style={styles.guildName}>{guild.name}</Text>
            {guild.description && (
              <Text style={globalStyles.textSecondary}>{guild.description}</Text>
            )}
            <View style={styles.stats}>
              <Text style={styles.stat}>👥 {guild.members?.length || 0} Members</Text>
              <Text style={styles.stat}>🎯 {quests.length} Quests</Text>
              <Text style={styles.stat}>✅ {tasks.length} Tasks</Text>
            </View>
          </Card>

          {/* Members */}
          <Card>
            <Text style={globalStyles.subtitle}>Members</Text>
            <View style={styles.membersGrid}>
              {guild.members?.map((member) => (
                <View key={member._id} style={styles.memberItem}>
                  <Avatar type={member.avatar || 'default'} size={50} level={member.level} />
                  <Text style={styles.memberName}>{member.username}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Tasks */}
          <View style={styles.sectionHeader}>
            <Text style={globalStyles.subtitle}>Tasks</Text>
            <Button
              title={showTaskForm ? 'Cancel' : '+ New'}
              onPress={() => setShowTaskForm(!showTaskForm)}
              size="small"
              variant={showTaskForm ? 'outline' : 'success'}
            />
          </View>

          {showTaskForm && (
            <Card variant="elevated">
              <Input
                label="Task Title"
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="What needs to be done?"
              />
              <Input
                label="Description (optional)"
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Add details"
                multiline
                numberOfLines={2}
              />
              <View style={styles.typeSelector}>
                <Text style={styles.typeLabel}>Task Type:</Text>
                <View style={styles.typeButtons}>
                  {['daily', 'weekly', 'monthly'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        taskType === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setTaskType(type)}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          taskType === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Button title="Create Task" onPress={handleCreateTask} loading={creating} />
            </Card>
          )}

          {tasks.length === 0 ? (
            <Card>
              <Text style={globalStyles.textMuted}>No tasks yet. Create one to get started!</Text>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task._id}>
                <View style={globalStyles.rowBetween}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.description && (
                      <Text style={globalStyles.textSecondary} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    <View style={styles.taskFooter}>
                      <View style={globalStyles.row}>
                        <Text style={styles.reward}>✨ {task.xpReward} XP</Text>
                        <Text style={styles.reward}>💰 {task.goldReward} Gold</Text>
                      </View>
                      <View style={[styles.typeBadge, styles[`${task.type}Badge`]]}>
                        <Text style={styles.typeText}>{task.type}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.taskActions}>
                  <Button
                    title="Complete"
                    onPress={() => handleCompleteTask(task._id)}
                    variant="success"
                    size="small"
                    style={styles.actionButton}
                  />
                  {user._id === task.createdBy?._id && (
                    <Button
                      title="Delete"
                      onPress={() => handleDeleteTask(task._id)}
                      variant="danger"
                      size="small"
                      style={styles.actionButton}
                    />
                  )}
                </View>
              </Card>
            ))
          )}

          {/* Quests */}
          {quests.length > 0 && (
            <>
              <Text style={globalStyles.subtitle}>Active Quests</Text>
              {quests.map((quest) => (
                <Card key={quest._id}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={globalStyles.textSecondary}>{quest.description}</Text>
                  <View style={styles.questProgress}>
                    <Text style={styles.progressText}>
                      Progress: {quest.progress} / {quest.goal}
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(quest.progress / quest.goal) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={globalStyles.row}>
                    <Text style={styles.reward}>✨ {quest.rewards?.xp} XP</Text>
                    <Text style={styles.reward}>💰 {quest.rewards?.gold} Gold</Text>
                  </View>
                </Card>
              ))}
            </>
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
  guildName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  stat: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.lg,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: 70,
  },
  memberName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  typeSelector: {
    marginBottom: theme.spacing.md,
  },
  typeLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.xs,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
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
  taskActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  questTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  questProgress: {
    marginVertical: theme.spacing.md,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import api from '../services/api';

export const GuildsScreen = ({ navigation }) => {
  const [guilds, setGuilds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    try {
      const data = await api.getGuilds();
      setGuilds(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guilds');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuilds();
    setRefreshing(false);
  };

  const handleCreateGuild = async () => {
    if (!guildName.trim()) {
      Alert.alert('Error', 'Guild name is required');
      return;
    }

    try {
      setCreating(true);
      const newGuild = await api.createGuild({
        name: guildName,
        description: guildDescription,
      });
      setGuilds([newGuild, ...guilds]);
      setShowCreateForm(false);
      setGuildName('');
      setGuildDescription('');
      Alert.alert('Success', 'Guild created successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={globalStyles.title}>Guilds</Text>
            <Button
              title={showCreateForm ? 'Cancel' : 'Create Guild'}
              onPress={() => setShowCreateForm(!showCreateForm)}
              size="small"
              variant={showCreateForm ? 'outline' : 'primary'}
            />
          </View>

          {showCreateForm && (
            <Card variant="elevated" style={styles.createForm}>
              <Text style={globalStyles.subtitle}>Create New Guild</Text>
              <Input
                label="Guild Name"
                value={guildName}
                onChangeText={setGuildName}
                placeholder="Enter guild name"
              />
              <Input
                label="Description (optional)"
                value={guildDescription}
                onChangeText={setGuildDescription}
                placeholder="Describe your guild"
                multiline
                numberOfLines={3}
              />
              <Button
                title="Create"
                onPress={handleCreateGuild}
                loading={creating}
              />
            </Card>
          )}

          {guilds.length === 0 ? (
            <Card>
              <Text style={globalStyles.text}>No guilds available yet</Text>
              <Text style={globalStyles.textMuted}>Be the first to create one!</Text>
            </Card>
          ) : (
            guilds.map((guild) => (
              <Card
                key={guild._id}
                onPress={() => navigation.navigate('GuildDetail', { guildId: guild._id })}
              >
                <View style={globalStyles.rowBetween}>
                  <View style={styles.guildInfo}>
                    <Text style={styles.guildName}>{guild.name}</Text>
                    {guild.description && (
                      <Text style={globalStyles.textSecondary} numberOfLines={2}>
                        {guild.description}
                      </Text>
                    )}
                    <View style={styles.guildStats}>
                      <Text style={styles.memberCount}>
                        👥 {guild.members?.length || 0} members
                      </Text>
                      <Text style={styles.questCount}>
                        🎯 {guild.quests?.length || 0} quests
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </Card>
            ))
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  createForm: {
    marginBottom: theme.spacing.lg,
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  guildStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  memberCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  questCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  arrow: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
});

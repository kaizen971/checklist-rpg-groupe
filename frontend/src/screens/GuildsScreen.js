import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card, Button, Input } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import api from '../services/api';

export const GuildsScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [guilds, setGuilds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [joiningGuildId, setJoiningGuildId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    try {
      const data = await api.getGuilds();
      setGuilds(data);
    } catch (error) {
      toast.error('Failed to load guilds! Check your connection and try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGuilds();
    setRefreshing(false);
  };

  const handleCreateGuild = async () => {
    if (!guildName.trim()) {
      toast.error('Guild name is required to forge your legend!');
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
      toast.success(`Guild "${newGuild.name}" founded! Now gather your party of heroes!`);
    } catch (error) {
      toast.error(error.message || 'Failed to create guild! Try a different name.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGuild = async (guildId, guildName) => {
    if (!user) {
      toast.error('You must be logged in to join a guild!');
      return;
    }

    try {
      setJoiningGuildId(guildId);
      await api.joinGuild(guildId, user._id);
      await refreshUser();
      await loadGuilds();
      toast.success(`You joined "${guildName}"! Your party awaits, hero!`);
    } catch (error) {
      toast.error(error.message || 'Failed to join guild! You may already be in one.');
    } finally {
      setJoiningGuildId(null);
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
            guilds.map((guild) => {
              const isUserInGuild = user?.guildId?._id === guild._id || user?.guildId === guild._id;
              const isUserInAnyGuild = user?.guildId !== null && user?.guildId !== undefined;

              return (
                <Card key={guild._id}>
                  <View style={globalStyles.rowBetween}>
                    <View style={styles.guildInfo}>
                      <Text style={styles.guildName}>{guild.name}</Text>
                      {guild.description && (
                        <Text style={globalStyles.textSecondary} numberOfLines={2}>
                          {guild.description}
                        </Text>
                      )}
                      <View style={styles.guildStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.memberCount}>
                            {' '}{guild.members?.length || 0} members
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="trophy" size={16} color={theme.colors.textSecondary} />
                          <Text style={styles.questCount}>
                            {' '}{guild.quests?.length || 0} quests
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.guildActions}>
                    {isUserInGuild ? (
                      <Button
                        title="View Guild"
                        onPress={() => navigation.navigate('GuildDetail', { guildId: guild._id })}
                        variant="primary"
                        size="small"
                      />
                    ) : (
                      <>
                        <Button
                          title="View"
                          onPress={() => navigation.navigate('GuildDetail', { guildId: guild._id })}
                          variant="outline"
                          size="small"
                          style={styles.actionButton}
                        />
                        {!isUserInAnyGuild && (
                          <Button
                            title="Join"
                            onPress={() => handleJoinGuild(guild._id, guild.name)}
                            variant="success"
                            size="small"
                            style={styles.actionButton}
                            loading={joiningGuildId === guild._id}
                          />
                        )}
                      </>
                    )}
                  </View>
                </Card>
              );
            })
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
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  memberCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
  guildActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginRight: theme.spacing.xs,
  },
});

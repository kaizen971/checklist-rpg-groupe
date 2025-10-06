import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Not Implemented', 'Account deletion will be available soon.');
          }
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, onPress, showChevron = true, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress && !rightComponent}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.textSecondary} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightComponent || (
        showChevron && <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const SettingSwitch = ({ icon, title, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.textSecondary} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
        thumbColor={value ? theme.colors.primary : theme.colors.surface}
      />
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollView}>
        <View style={styles.container}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card>
              <SettingItem
                icon="person-outline"
                title="Edit Profile"
                onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon.')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="mail-outline"
                title="Email"
                showChevron={false}
                rightComponent={<Text style={styles.emailText}>{user?.email}</Text>}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="key-outline"
                title="Change Password"
                onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}
              />
            </Card>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Card>
              <SettingSwitch
                icon="notifications-outline"
                title="Notifications"
                value={notifications}
                onValueChange={setNotifications}
              />
              <View style={styles.divider} />
              <SettingSwitch
                icon="moon-outline"
                title="Dark Mode"
                value={darkMode}
                onValueChange={setDarkMode}
              />
              <View style={styles.divider} />
              <SettingSwitch
                icon="volume-high-outline"
                title="Sound Effects"
                value={soundEffects}
                onValueChange={setSoundEffects}
              />
            </Card>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Info</Text>
            <Card>
              <SettingItem
                icon="information-circle-outline"
                title="About"
                onPress={() => Alert.alert('Checklist RPG', 'Version 1.0.0\n\nA gamified task management app for guilds.')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="book-outline"
                title="Terms & Conditions"
                onPress={() => Alert.alert('Coming Soon', 'Terms & Conditions will be available soon.')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                onPress={() => Alert.alert('Coming Soon', 'Privacy Policy will be available soon.')}
              />
            </Card>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
            <Card>
              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
                  <Text style={[styles.settingTitle, styles.dangerText]}>Logout</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
                <View style={styles.settingLeft}>
                  <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
                  <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                </View>
              </TouchableOpacity>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  dangerTitle: {
    color: theme.colors.danger,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  dangerText: {
    color: theme.colors.danger,
  },
  emailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
});

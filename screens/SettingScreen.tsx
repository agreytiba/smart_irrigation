import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Swahili'>('English');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#767577', true: '#16a34a' }}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#767577', true: '#16a34a' }}
        />
      </View>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Language</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity 
            style={[styles.languageButton, language === 'English' && styles.activeLanguage]}
            onPress={() => setLanguage('English')}
          >
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.languageButton, language === 'Swahili' && styles.activeLanguage]}
            onPress={() => setLanguage('Swahili')}
          >
            <Text style={styles.languageText}>Swahili</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2c3e50',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: {
    fontSize: 16,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeLanguage: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  languageText: {
    color: '#333',
  },
});

export default SettingsScreen;
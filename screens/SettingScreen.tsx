// SettingsScreen.tsx (updated)
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button, ActivityIndicator } from 'react-native';
import i18n from '../i18n/localization';
import { useLanguage } from '../context/LanguageContext';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t('settings')}</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>{i18n.t('notifications')}</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          thumbColor="#16a34a"
          trackColor={{ false: '#ccc', true: '#a7f3d0' }}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>{i18n.t('darkMode')}</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor="#16a34a"
          trackColor={{ false: '#ccc', true: '#a7f3d0' }}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>{i18n.t('language')}</Text>
        <Button
          title={language === 'en' ? 'Switch to Swahili' : 'Badilisha lugha kwenda Kiingereza'}
          onPress={toggleLanguage}
          color="#16a34a"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f1f5f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    marginTop: 40,
  },
});

export default SettingsScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [intervalMinutes, setIntervalMinutes] = useState(20);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  useEffect(() => {
    setLocalDarkMode(darkMode);
    AsyncStorage.getItem('relaxationInterval').then((val) => {
      if (val) setIntervalMinutes(parseInt(val));
    });
  }, [darkMode]);

  const handleToggle = () => toggleDarkMode();

  const handleIntervalChange = (value: number) => {
    setIntervalMinutes(value);
    AsyncStorage.setItem('relaxationInterval', value.toString());
  };

  const resetSettings = async () => {
    await AsyncStorage.removeItem('relaxationInterval');
    setIntervalMinutes(20);
    if (darkMode) toggleDarkMode();
    Alert.alert('Settings Reset', 'All settings have been reset to default.');
  };

  const toggleDropdown = (section: 'about' | 'privacy') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'about') setAboutExpanded(!aboutExpanded);
    else setPrivacyExpanded(!privacyExpanded);
  };

  const themed = (style: any) => [style, localDarkMode && styles.darkText];
  const cardStyle = [styles.card, localDarkMode && styles.darkCard];

  return (
    <ScrollView contentContainerStyle={[styles.container, localDarkMode && styles.darkBackground]}>
      <Text style={themed(styles.title)}>Settings</Text>

      {/* Dark Mode */}
      <View style={cardStyle}>
        <View style={styles.settingItem}>
          <Ionicons name="moon" size={24} color={localDarkMode ? '#f5dd4b' : '#333'} />
          <Text style={themed(styles.label)}>Dark Mode</Text>
          <Switch
            value={localDarkMode}
            onValueChange={handleToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={localDarkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Reminder Interval */}
      <View style={cardStyle}>
        <View style={styles.settingItem}>
          <Ionicons name="time" size={24} color={localDarkMode ? '#f5dd4b' : '#333'} />
          <Text style={themed(styles.label)}>Relaxation Reminder</Text>
        </View>
        <Text style={themed(styles.intervalValue)}>{intervalMinutes} min</Text>
        <Slider
          style={{ width: '100%' }}
          minimumValue={5}
          maximumValue={60}
          step={5}
          value={intervalMinutes}
          onValueChange={handleIntervalChange}
          minimumTrackTintColor="#81b0ff"
          maximumTrackTintColor="#ccc"
          thumbTintColor={localDarkMode ? '#f5dd4b' : '#4a90e2'}
        />
      </View>

      {/* App Info */}
      <View style={cardStyle}>
        <View style={styles.settingItem}>
          <Ionicons name="information-circle" size={24} color={localDarkMode ? '#f5dd4b' : '#333'} />
          <Text style={themed(styles.label)}>App Info</Text>
        </View>
        <Text style={themed(styles.infoLabel)}>Version: 1.0.0</Text>
        <Text style={themed(styles.infoLabel)}>Contact: support@lightbreaker.app</Text>
      </View>

      {/* About Dropdown */}
      <View style={cardStyle}>
        <TouchableOpacity onPress={() => toggleDropdown('about')}>
          <Text style={themed(styles.dropdownToggle)}>
            📘 About {aboutExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {aboutExpanded && (
          <Text style={themed(styles.dropdownText)}>
            LightBreaker was made to help people suffering from eye strain relax, refocus, and be more productive.
          </Text>
        )}
      </View>

      {/* Privacy Policy Dropdown */}
      <View style={cardStyle}>
        <TouchableOpacity onPress={() => toggleDropdown('privacy')}>
          <Text style={themed(styles.dropdownToggle)}>
            🔒 Privacy Policy {privacyExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        {privacyExpanded && (
          <Text style={themed(styles.dropdownText)}>
            We don’t collect your data. Everything is stored only on your device.
          </Text>
        )}
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={[styles.resetButton, localDarkMode && styles.darkResetButton]} onPress={resetSettings}>
        <Ionicons name="refresh-circle" size={22} color="#fff" />
        <Text style={styles.resetButtonText}>Reset All Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  intervalValue: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  dropdownToggle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  dropdownText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  darkText: {
    color: '#f0f0f0',
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  darkResetButton: {
    backgroundColor: '#3a68d0',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

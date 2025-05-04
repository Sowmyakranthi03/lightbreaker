import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Vibration, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../hooks/useTheme';

export default function EyeRelaxationScreen() {
  const [countdown, setCountdown] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(20);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const { darkMode } = useTheme();

  // On screen focus: load settings & schedule reminder if enabled
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const interval = await AsyncStorage.getItem('relaxationInterval');
        const reminder = await AsyncStorage.getItem('relaxationReminderEnabled');
        if (interval) setIntervalMinutes(parseInt(interval));
        if (reminder !== null) setReminderEnabled(reminder === 'true');

        if (reminder === 'true') {
          await scheduleRelaxationReminder(parseInt(interval || '20'));
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      })();
    }, [])
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isRunning && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (isRunning && countdown === 0) {
      setIsRunning(false);
      Vibration.vibrate(1000);
      if (reminderEnabled) scheduleRelaxationReminder(intervalMinutes);
    }
    return () => clearTimeout(timer);
  }, [isRunning, countdown]);

  const scheduleRelaxationReminder = async (minutes: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      const { granted: requested } = await Notifications.requestPermissionsAsync();
      if (!requested) return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👁 Time to Relax!',
        body: 'Look at something 20 feet away for 20 seconds.',
      },
      trigger: {
        type: 'timeInterval',
        seconds: minutes * 60,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
      
      
    });
  };

  const handleToggleReminder = async () => {
    const newValue = !reminderEnabled;
    setReminderEnabled(newValue);
    await AsyncStorage.setItem('relaxationReminderEnabled', newValue.toString());
    if (newValue) {
      scheduleRelaxationReminder(intervalMinutes);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkBackground]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>20-20-20 Eye Relaxation</Text>
      <Text style={[styles.instructions, darkMode && styles.darkText]}>
        Every {intervalMinutes} minutes, look at something 20 feet away for 20 seconds.
      </Text>

      <AnimatedCircularProgress
        size={180}
        width={15}
        fill={(countdown / 20) * 100}
        tintColor="#4a90e2"
        backgroundColor="#eee"
        style={{ marginBottom: 20 }}
      >
        {() => <Text style={[styles.timer, darkMode && styles.darkText]}>{countdown}s</Text>}
      </AnimatedCircularProgress>

      <View style={styles.buttonContainer}>
        <Button
          title={isRunning ? '⏸ Pause' : '▶️ Start'}
          onPress={() => {
            if (countdown === 0) setCountdown(20);
            setIsRunning(!isRunning);
          }}
        />
        <Button
          title="🔁 Reset"
          onPress={() => {
            setCountdown(20);
            setIsRunning(false);
          }}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.label, darkMode && styles.darkText]}>Reminders</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={handleToggleReminder}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={reminderEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  darkText: {
    color: '#f0f0f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
  },
});

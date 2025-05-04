// hooks/useRelaxationReminder.ts
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'relaxationReminderEnabled';

export const useRelaxationReminder = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) setEnabled(value === 'true');
    });
  }, []);

  const updateReminder = async (value: boolean) => {
    setEnabled(value);
    await AsyncStorage.setItem(STORAGE_KEY, value.toString());

    if (value) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👁 Time to Relax!',
          body: 'Follow the 20-20-20 rule for healthy eyes.',
        },
             trigger: {
               type: 'timeInterval',
               seconds: minutes * 60,
               repeats: true,
             } as Notifications.TimeIntervalTriggerInput,
             
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return { enabled, updateReminder };
};

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const STORAGE_KEY = 'eyeRelaxationEnabled';
const TASKS_KEY = 'todoTasks';

export default function EyeRelaxationScreen() {
  const { darkMode: isDarkMode } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [tasks, setTasks] = useState<{ text: string; completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
      setIsEnabled(storedValue === 'true');

      const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const scheduleNotification = async () => {
      if (isEnabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Eye Relaxation',
            body: 'Time to follow the 20-20-20 rule!',
          },
          trigger: {
            seconds: 20 * 60,
            repeats: true,
            type: 'timeInterval',
          } as Notifications.NotificationTriggerInput,
        });
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    };
    scheduleNotification();
  }, [isEnabled]);

  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await AsyncStorage.setItem(STORAGE_KEY, newValue.toString());
  };

  const handleAddTask = async () => {
    if (newTask.trim() === '') return;
    const updatedTasks = [...tasks, { text: newTask, completed: false }];
    setTasks(updatedTasks);
    setNewTask('');
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  };

  const handleDeleteTask = async (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  };

  const handleToggleComplete = async (index: number) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={StyleSheet.flatten([themeStyles.container])}
    >
      <View style={themeStyles.titleCard}>
        <Ionicons name="flash" size={32} color="#ffd700" style={{ marginRight: 10 }} />
        <Text style={themeStyles.title}>LightBreaker</Text>
      </View>

      <View style={themeStyles.card}>
        <Text style={themeStyles.cardTitle}>20-20-20 Eye Relaxation Reminder</Text>
        <Switch value={isEnabled} onValueChange={toggleSwitch} />
      </View>

      <View style={themeStyles.card}>
        <Text style={themeStyles.cardTitle}>To-Do List</Text>
        {tasks.length === 0 ? (
          <Text style={themeStyles.emptyText}>No tasks yet. Add one!</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={themeStyles.taskItem}>
                <TouchableOpacity onPress={() => handleToggleComplete(index)}>
                  <Ionicons
                    name={item.completed ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.completed ? '#4a90e2' : '#999'}
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                <Text
                  style={[themeStyles.taskText, item.completed && themeStyles.completedTaskText]}
                >
                  {item.text}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTask(index)}>
                  <Ionicons name="trash-bin" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        <View style={themeStyles.inputContainer}>
          <TextInput
            style={themeStyles.input}
            value={newTask}
            onChangeText={setNewTask}
            placeholder="Add new task..."
            placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity onPress={handleAddTask}>
            <Ionicons name="add-circle" size={32} color="#4a90e2" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const baseContainer: ViewStyle = {
  flex: 1,
  padding: 20,
};

const baseTitle: TextStyle = {
  fontSize: 32,
  fontWeight: 'bold',
  alignSelf: 'center',
  textShadowColor: '#a3c9f9',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 6,
};

const baseHeaderWrapper: ViewStyle = {
  paddingTop: 40,
  paddingBottom: 20,
  backgroundColor: 'transparent',
};

const baseCard: ViewStyle = {
  borderRadius: 16,
  padding: 16,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4,
};

const baseCardTitle: TextStyle = {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
};

const baseTaskItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 8,
};

const baseTaskText: TextStyle = {
  fontSize: 16,
  flex: 1,
};

const baseCompletedTaskText: TextStyle = {
  textDecorationLine: 'line-through',
  opacity: 0.5,
};

const baseInputContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
};

const baseInput: TextStyle = {
  flex: 1,
  borderBottomWidth: 1,
  marginRight: 10,
  fontSize: 16,
  paddingBottom: 4,
};

const lightStyles = StyleSheet.create({
  container: {
    ...baseContainer,
    backgroundColor: '#fff',
  },
  titleCard: {
    ...baseCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    marginBottom: 30,
    paddingVertical: 90,
    backgroundColor: '#eef6ff',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  headerWrapper: baseHeaderWrapper,
  title: {
    ...baseTitle,
    color: '#4a90e2',
  },
  card: {
    ...baseCard,
    backgroundColor: '#f8f8f8',
  },
  cardTitle: {
    ...baseCardTitle,
    color: '#333',
  },
  taskItem: baseTaskItem,
  taskText: {
    ...baseTaskText,
    color: '#000',
  },
  completedTaskText: baseCompletedTaskText,
  inputContainer: baseInputContainer,
  input: {
    ...baseInput,
    color: '#000',
    borderBottomColor: '#ccc',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    ...baseContainer,
    backgroundColor: '#121212',
  },
  titleCard: {
    ...baseCard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingVertical: 90,
    backgroundColor: '#1f1f1f',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  headerWrapper: baseHeaderWrapper,
  title: {
    ...baseTitle,
    color: '#4a90e2',
  },
  card: {
    ...baseCard,
    backgroundColor: '#1e1e1e',
  },
  cardTitle: {
    ...baseCardTitle,
    color: '#eee',
  },
  taskItem: baseTaskItem,
  taskText: {
    ...baseTaskText,
    color: '#fff',
  },
  completedTaskText: baseCompletedTaskText,
  inputContainer: baseInputContainer,
  input: {
    ...baseInput,
    color: '#fff',
    borderBottomColor: '#666',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 10,
  },
});

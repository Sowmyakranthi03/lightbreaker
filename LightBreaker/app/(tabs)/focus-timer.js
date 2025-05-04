import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Vibration, TextInput } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useTheme } from '../../hooks/useTheme'; // Global dark mode hook

const defaultTimers = [
  { label: '🪥 Brushing', time: { h: 0, m: 2, s: 0 } },
  { label: '🎯 Focus', time: { h: 0, m: 25, s: 0 } },
  { label: '📖 Reading', time: { h: 0, m: 15, s: 0 } }
];

const modes = [
  { label: '🎯 Focus', time: { h: 0, m: 25, s: 0 } },
  { label: '☕ Short Break', time: { h: 0, m: 5, s: 0 } },
  { label: '🌙 Long Break', time: { h: 0, m: 15, s: 0 } },
  { label: '📖 Reading', time: { h: 0, m: 15, s: 0 } },
];

export default function FocusTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(1500);
  const [remaining, setRemaining] = useState(1500);
  const [running, setRunning] = useState(false);
  const [savedTimers, setSavedTimers] = useState([]);
  const [activeModeIndex, setActiveModeIndex] = useState(null);
  const [customLabel, setCustomLabel] = useState('');
  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setTotalSeconds(total);
    setRemaining(total);
  }, [hours, minutes, seconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            Vibration.vibrate();
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/bell.mp3'));
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('Failed to play sound', e);
    }
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleSave = () => {
    const label = customLabel.trim() !== '' ? customLabel : `🕒 ${formatTime(hours * 3600 + minutes * 60 + seconds)}`;
    const newTimer = { label, time: { h: hours, m: minutes, s: seconds } };
    setSavedTimers((prev) => [...prev, newTimer]);
    setCustomLabel('');
    Haptics.selectionAsync();
  };

  const handleLoadTimer = (time) => {
    setHours(time.h);
    setMinutes(time.m);
    setSeconds(time.s);
  };

  const handleDeleteTimer = (index) => {
    const newTimers = [...savedTimers];
    newTimers.splice(index, 1);
    setSavedTimers(newTimers);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetTimer = () => {
    setRemaining(totalSeconds);
    setRunning(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: darkMode ? '#121212' : '#fff' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <AnimatedCircularProgress
          size={200}
          width={10}
          fill={totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0}
          tintColor="#00e0ff"
          backgroundColor={darkMode ? '#333' : '#ccc'}
        >
          {() => (
            <Text style={{ fontSize: 30, color: darkMode ? '#f0f0f0' : '#000' }}>
              {formatTime(remaining)}
            </Text>
          )}
        </AnimatedCircularProgress>
      </View>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: darkMode ? '#f0f0f0' : '#000' }}>Mode</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          {modes.map((mode, index) => (
            <TouchableOpacity
              key={index}
              style={{
                padding: 10,
                borderRadius: 10,
                margin: 5,
                backgroundColor: activeModeIndex === index ? '#4CAF50' : (darkMode ? '#333' : '#ccc')
              }}
              onPress={() => {
                handleLoadTimer(mode.time);
                setActiveModeIndex(index);
              }}
            >
              <Text style={{ color: darkMode ? '#f0f0f0' : '#000' }}>{mode.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: darkMode ? '#f0f0f0' : '#000' }}>
        Set Duration
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {[
          { label: 'H', value: hours, setter: setHours, max: 23 },
          { label: 'M', value: minutes, setter: setMinutes, max: 59 },
          { label: 'S', value: seconds, setter: setSeconds, max: 59 }
        ].map((unit, i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => unit.setter((unit.value + 1) > unit.max ? 0 : unit.value + 1)}
            >
              <Text style={{ fontSize: 20, color: darkMode ? '#f0f0f0' : '#000' }}>▲</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 24, color: darkMode ? '#f0f0f0' : '#000' }}>
              {unit.value.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              onPress={() => unit.setter((unit.value - 1) < 0 ? unit.max : unit.value - 1)}
            >
              <Text style={{ fontSize: 20, color: darkMode ? '#f0f0f0' : '#000' }}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TextInput
        placeholder="Name your timer (optional)"
        value={customLabel}
        onChangeText={setCustomLabel}
        placeholderTextColor={darkMode ? '#aaa' : '#666'}
        style={{
          borderWidth: 1,
          borderColor: darkMode ? '#444' : '#ccc',
          borderRadius: 10,
          padding: 10,
          marginVertical: 20,
          color: darkMode ? '#f0f0f0' : '#000'
        }}
      />

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, color: darkMode ? '#f0f0f0' : '#000' }}>Saved Timers</Text>
      {[...defaultTimers, ...savedTimers].map((timer, idx) => (
        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
          <TouchableOpacity onPress={() => handleLoadTimer(timer.time)}>
            <Text style={{ color: darkMode ? '#f0f0f0' : '#000' }}>{timer.label}</Text>
          </TouchableOpacity>
          {idx >= defaultTimers.length && (
            <TouchableOpacity onPress={() => handleDeleteTimer(idx - defaultTimers.length)}>
              <Text style={{ color: 'red' }}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }}>
        <TouchableOpacity onPress={() => setRunning(true)} style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>▶ START</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRunning(false)} style={{ backgroundColor: '#FFC107', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>⏸ PAUSE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetTimer} style={{ backgroundColor: '#2196F3', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>🔄 RESET</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#9C27B0', padding: 10, borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>💾 SAVE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../contexts/UserContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  work: number; // 25 minutes in seconds
  shortBreak: number; // 5 minutes in seconds
  longBreak: number; // 15 minutes in seconds
}

interface Task {
  id: string;
  text: string;
}

export default function PomodoroTimer() {
  const router = useRouter();
  const { isDarkMode } = useUser();
  
  // Colors
  const backgroundColor = (!isDarkMode ? Colors.light.background : Colors.dark.background);
  const textColor = (!isDarkMode ? Colors.light.text : Colors.dark.text);
  const textInputColor = (!isDarkMode ? Colors.light.textInput : Colors.dark.textInput);
  const buttonColor = Colors.button;

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentGif, setCurrentGif] = useState<'catboat' | 'icey'>(() => 
    Math.random() < 0.5 ? 'catboat' : 'icey'
  );

  // Timer settings
  const timerSettings: TimerSettings = {
    work: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer title based on current mode
  const getTimerTitle = (): string => {
    switch (currentMode) {
      case 'work':
        return 'Pomodoro';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Pomodoro';
    }
  };

  // Start timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  // Pause timer
  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(timerSettings[currentMode]);
    // Also randomize GIF on reset for more variety
    const randomGif = Math.random() < 0.5 ? 'catboat' : 'icey';
    console.log('Random GIF on reset:', randomGif);
    setCurrentGif(randomGif);
  };

  // Switch to next timer mode
  const switchToNextMode = () => {
    if (currentMode === 'work') {
      const newSessions = completedSessions + 1;
      setCompletedSessions(newSessions);
      
      // Every 4 work sessions, take a long break
      if (newSessions % 4 === 0) {
        setCurrentMode('longBreak');
        setTimeLeft(timerSettings.longBreak);
      } else {
        setCurrentMode('shortBreak');
        setTimeLeft(timerSettings.shortBreak);
      }
    } else {
      setCurrentMode('work');
      setTimeLeft(timerSettings.work);
    }
  };

  // Add task
  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim()
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer finished
            Vibration.vibrate(1000); // Vibrate for 1 second
            Alert.alert(
              'Timer Complete!',
              `${getTimerTitle()} is finished!`,
              [
                {
                  text: 'Continue',
                  onPress: () => {
                    switchToNextMode();
                    setIsRunning(false);
                  }
                }
              ]
            );
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode]);



  // Reset time when mode changes
  useEffect(() => {
    setTimeLeft(timerSettings[currentMode]);
  }, [currentMode]);

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, { backgroundColor: textInputColor }]}>
      <Text style={[styles.taskText, { color: textColor }]}>{item.text}</Text>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <X size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Pomodoro Timer</Text>
        </View>

        {/* Mode Selection Pills */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modePill,
              currentMode === 'work' && styles.modePillSelected,
              { backgroundColor: currentMode === 'work' ? 'transparent' : textInputColor }
            ]}
            onPress={() => {
              setCurrentMode('work');
              setTimeLeft(timerSettings.work);
              setIsRunning(false);
            }}
          >
            <Text style={[styles.modePillText, { color: textColor }]}>Pomodoro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modePill,
              currentMode === 'shortBreak' && styles.modePillSelected,
              { backgroundColor: currentMode === 'shortBreak' ? 'transparent' : textInputColor }
            ]}
            onPress={() => {
              setCurrentMode('shortBreak');
              setTimeLeft(timerSettings.shortBreak);
              setIsRunning(false);
            }}
          >
            <Text style={[styles.modePillText, { color: textColor }]}>Short Break</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modePill,
              currentMode === 'longBreak' && styles.modePillSelected,
              { backgroundColor: currentMode === 'longBreak' ? 'transparent' : textInputColor }
            ]}
            onPress={() => {
              setCurrentMode('longBreak');
              setTimeLeft(timerSettings.longBreak);
              setIsRunning(false);
            }}
          >
            <Text style={[styles.modePillText, { color: textColor }]}>Long Break</Text>
          </TouchableOpacity>
        </View>

        {/* Round Indicator */}
        <Text style={[styles.roundText, { color: textColor }]}>
          Round {completedSessions + 1}
        </Text>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Image 
            source={currentGif === 'catboat' 
              ? require('../../assets/images/catboat.gif')
              : require('../../assets/images/icey.gif')
            }
            style={[
              styles.gifAnimation,
              { opacity: isRunning ? 1 : 0.6 }
            ]}
            resizeMode="contain"
          />
          
          {/* GIF Credit - right below the GIF */}
          <Text style={[styles.gifCredit, { color: textColor }]}>
            {currentGif === 'catboat' 
              ? '🐱⛵ by Assma Amedi' 
              : '❄️ by Robin Griffiths'
            }
          </Text>
          
          <Text style={[styles.timer, { color: textColor }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetTimer}
          >
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          {!isRunning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startTimer}
            >
              <Text style={styles.controlButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.startButton}
              onPress={pauseTimer}
            >
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: textColor }]} />

        {/* Tasks Section */}
        <View style={styles.tasksContainer}>
          <Text style={[styles.tasksTitle, { color: textColor }]}>Tasks</Text>
          
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            style={styles.tasksList}
            scrollEnabled={false}
          />

          {/* Add Task Input */}
          <View style={styles.addTaskContainer}>
            <TextInput
              style={[styles.taskInput, { backgroundColor: textInputColor, color: textColor }]}
              placeholder="Enter task.."
              placeholderTextColor={!isDarkMode ? Colors.light.placeholderText : Colors.dark.placeholderText}
              value={newTaskText}
              onChangeText={setNewTaskText}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modePill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    minHeight: 36,
  },
  modePillSelected: {
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  modePillText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    lineHeight: 16,
  },
  roundText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  gifAnimation: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    marginBottom: 10,
  },
  gifCredit: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 5,
    opacity: 0.7,
  },
  timerIcon: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  timer: {
    fontSize: 72,
    fontFamily: 'Poppins-Bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#5CAEF1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5CAEF1',
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  divider: {
    height: 1,
    marginBottom: 30,
  },
  tasksContainer: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
  },
  tasksList: {
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    backgroundColor: '#5CAEF1',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

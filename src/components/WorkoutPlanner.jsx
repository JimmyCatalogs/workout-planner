'use client';
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { exerciseData } from '../data/exercises.js';
import Goals from './Goals';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Theme toggle component
const ThemeToggle = ({ darkMode, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-lg hover:bg-[var(--secondary-bg)] transition-colors"
    aria-label="Toggle dark mode"
  >
    {darkMode ? '☀️' : '🌙'}
  </button>
);

// Client-side only wrapper component for drag and drop
const ExerciseModal = ({ isOpen, onClose, onSelectExercise, exercises }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-[var(--card-bg)] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[var(--foreground)] mb-4">
                  Select Exercise
                </Dialog.Title>
                <div className="mt-2 max-h-[60vh] overflow-y-auto">
                  {exercises.map((exercise, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        onSelectExercise(exercise);
                        onClose();
                      }}
                      className="p-3 mb-2 bg-[var(--accent-bg)] rounded-lg cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      <p className="font-medium text-sm mb-2 text-[var(--foreground)]">{exercise.Exercise}</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(exercise)
                          .filter(([key, value]) => key !== 'Exercise' && value > 0)
                          .map(([muscle, value]) => (
                            <span 
                              key={muscle}
                              className="inline-block px-2 py-1 bg-[var(--card-bg)] rounded text-xs text-[var(--foreground)] font-medium"
                            >
                              {muscle}: {value}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const DragDropWrapper = ({ children, day, exercises, setsPerDay, muscleFrequency, workoutDays, weeklyPlan, muscleGoals, onAddExercise }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalSets = exercises.reduce((total, exercise) => total + (exercise.sets || 1), 0);
  const hasExercises = exercises.length > 0;
  
  // Calculate total workout days
  const totalWorkoutDays = Object.values(weeklyPlan).filter(dayExercises => dayExercises.length > 0).length;
  
  // Calculate muscle frequencies
  // Calculate daily muscle activation
  const getDailyMuscleActivation = () => {
    const activation = {};
    exercises.forEach(exercise => {
      const sets = exercise.sets || 1;
      Object.entries(exercise).forEach(([key, value]) => {
        if (key !== 'Exercise' && key !== 'sets' && value > 0) {
          activation[key] = (activation[key] || 0) + (value * sets);
        }
      });
    });
    return activation;
  };

  // Calculate weekly muscle frequencies
  const getMuscleFrequencies = () => {
    const frequencies = {};
    Object.values(weeklyPlan).forEach(dayExercises => {
      dayExercises.forEach(exercise => {
        Object.entries(exercise).forEach(([key, value]) => {
          if (key !== 'Exercise' && key !== 'sets' && value > 0) {
            frequencies[key] = (frequencies[key] || 0) + 1;
          }
        });
      });
    });
    return frequencies;
  };
  
  const dailyActivation = getDailyMuscleActivation();
  const muscleFrequencies = getMuscleFrequencies();
  const anyMuscleBelowTarget = Object.values(muscleFrequencies).some(freq => freq < muscleFrequency);
  
  // Check which muscles exceed daily limit
  const exceededMuscles = Object.entries(dailyActivation)
    .map(([muscle, activation]) => {
      const weeklyGoal = muscleGoals[muscle] || 0;
      const dailyLimit = weeklyGoal / muscleFrequency;
      if (weeklyGoal > 0 && activation > dailyLimit) {
        return {
          muscle,
          current: activation,
          limit: dailyLimit
        };
      }
      return null;
    })
    .filter(Boolean);
  
  const dailyLimitExceeded = exceededMuscles.length > 0;

  // Determine border color and warning messages
  let borderColor = 'border-[var(--border-color)]';
  let warningMessages = [];
  
  if (totalSets > setsPerDay) {
    borderColor = 'border-red-500';
    warningMessages.push(`Exceeds max sets (${totalSets}/${setsPerDay})`);
  }
  
  if (workoutDays > 0) {
    if (hasExercises && totalWorkoutDays > workoutDays) {
      borderColor = 'border-red-500';
      warningMessages.push('Too many workout days');
    } else if (hasExercises && totalWorkoutDays < workoutDays && day === 'Sunday') {
      borderColor = 'border-red-500';
      warningMessages.push('Not enough workout days');
    }
  }
  
  if (anyMuscleBelowTarget && day === 'Sunday') {
    borderColor = 'border-red-500';
    warningMessages.push('Some muscles below target frequency');
  }

  if (dailyLimitExceeded) {
    borderColor = borderColor === 'border-[var(--border-color)]' ? 'border-yellow-500' : borderColor;
    exceededMuscles.forEach(({ muscle, current, limit }) => {
      warningMessages.push(`${muscle}: ${Math.round(current)}/${Math.round(limit)} daily limit`);
    });
  }

  if (!isMounted) {
    return (
      <div className={`h-[300px] md:h-[384px] border-2 rounded-lg bg-[var(--card-bg)] shadow-sm ${borderColor}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`h-[300px] md:h-[384px] border-2 rounded-lg bg-[var(--card-bg)] shadow-sm transition-all ${borderColor}`}>
      <div className="flex justify-between items-center p-2 bg-[var(--accent-bg)] border-b border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--foreground)]">{day}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddExercise}
            className="md:hidden px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
          <span className="text-sm text-[var(--foreground)]">{totalSets} sets</span>
        </div>
      </div>
      {warningMessages.length > 0 && (
        <div className={`px-2 py-1 ${borderColor === 'border-red-500' ? 'bg-red-500' : 'bg-yellow-500'} bg-opacity-10 border-b ${borderColor}`}>
          {warningMessages.map((message, index) => (
            <div key={index} className={`text-xs ${borderColor === 'border-red-500' ? 'text-red-500' : 'text-yellow-600'}`}>
              {message}
            </div>
          ))}
        </div>
      )}
      <div className="overflow-y-auto h-[248px] md:h-[332px]">
        {children}
      </div>
    </div>
  );
};

const DaySelectionModal = ({ isOpen, onClose, onSelectDay, currentDay }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-[var(--card-bg)] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-[var(--foreground)] mb-4">
                  Move Exercise To
                </Dialog.Title>
                <div className="mt-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        onSelectDay(day);
                        onClose();
                      }}
                      className={`w-full p-3 mb-2 rounded-lg cursor-pointer transition-colors text-[var(--foreground)] text-left ${
                        day === currentDay 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'bg-[var(--accent-bg)] hover:bg-[var(--accent-hover)]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const ExerciseCard = ({ exercise, index, removeExercise, updateSets, onMove, currentDay }) => {
  return (
    <div className="p-2 mb-2 bg-[var(--accent-bg)] rounded-lg text-sm text-[var(--foreground)] shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="font-medium">{exercise.Exercise}</span>
        <div className="flex gap-2">
          <button
            onClick={onMove}
            className="md:hidden text-blue-500 hover:text-blue-700 transition-colors text-xs px-2 py-1 bg-[var(--card-bg)] rounded"
          >
            Move
          </button>
          <button
            onClick={removeExercise}
            className="text-red-500 hover:text-red-700 font-bold transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onClick={() => updateSets(-1)}
          className="px-2 py-1 bg-[var(--card-bg)] hover:bg-[var(--accent-hover)] rounded transition-colors"
        >
          -
        </button>
        <span className="font-medium">{exercise.sets || 1} sets</span>
        <button
          onClick={() => updateSets(1)}
          className="px-2 py-1 bg-[var(--card-bg)] hover:bg-[var(--accent-hover)] rounded transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

const WorkoutPlanner = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [muscleGoals, setMuscleGoals] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDaysForGraph, setSelectedDaysForGraph] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isDaySelectionModalOpen, setIsDaySelectionModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedExerciseDay, setSelectedExerciseDay] = useState(null);
  const moveExercise = (fromDay, toDay, exerciseIndex) => {
    setWeeklyPlan(prev => {
      const newPlan = { ...prev };
      const [exercise] = newPlan[fromDay].splice(exerciseIndex, 1);
      newPlan[toDay] = [...newPlan[toDay], exercise];
      return newPlan;
    });
  };

  const [weeklyPlan, setWeeklyPlan] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to handle theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const calculateTotalMuscleActivation = () => {
    const totals = {
      Chest: 0, Back: 0, Shoulders: 0, Biceps: 0, Triceps: 0,
      Quadriceps: 0, Hamstrings: 0, Glutes: 0, Calves: 0, Abs: 0
    };
    
    Object.entries(weeklyPlan)
      .filter(([day]) => selectedDaysForGraph.includes(day))
      .forEach(([_, dayExercises]) => {
      dayExercises.forEach(exercise => {
        const sets = exercise.sets || 1;
        Object.keys(totals).forEach(muscle => {
          totals[muscle] += (exercise[muscle] || 0) * sets;
        });
      });
    });
    
    return Object.entries(totals).map(([name, value]) => {
      const goal = muscleGoals[name] || 0;
      const percentage = goal ? Math.round((value / goal) * 100) : null;
      return {
        muscle: name,
        activation: value,
        percentage: percentage
      };
    });
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // If dragging from exercise library
    if (source.droppableId === 'exercise-library') {
      const exercise = exerciseData[source.index];
      const exerciseWithSets = { ...exercise, sets: 1 };
      setWeeklyPlan(prev => ({
        ...prev,
        [destination.droppableId]: [
          ...prev[destination.droppableId],
          exerciseWithSets
        ]
      }));
      return;
    }

    // If reordering within the same day
    if (source.droppableId === destination.droppableId) {
      const day = source.droppableId;
      const exercises = Array.from(weeklyPlan[day]);
      const [removed] = exercises.splice(source.index, 1);
      exercises.splice(destination.index, 0, removed);

      setWeeklyPlan(prev => ({
        ...prev,
        [day]: exercises
      }));
    } else {
      // Moving between days
      const sourceDay = source.droppableId;
      const destDay = destination.droppableId;
      const sourceExercises = Array.from(weeklyPlan[sourceDay]);
      const destExercises = Array.from(weeklyPlan[destDay]);
      const [removed] = sourceExercises.splice(source.index, 1);
      destExercises.splice(destination.index, 0, removed);

      setWeeklyPlan(prev => ({
        ...prev,
        [sourceDay]: sourceExercises,
        [destDay]: destExercises
      }));
    }
  };

  const removeExercise = (day, index) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateSets = (day, index, change) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: prev[day].map((exercise, i) => {
        if (i === index) {
          const newSets = Math.max(1, (exercise.sets || 1) + change);
          return { ...exercise, sets: newSets };
        }
        return exercise;
      })
    }));
  };

  return (
    <div className="h-screen bg-[var(--background)]">
      <nav className="bg-[var(--card-bg)] border-b border-[var(--border-color)] px-2 md:px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-2 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                activeTab === 'planner'
                  ? 'bg-[var(--accent-bg)] text-[var(--foreground)]'
                  : 'hover:bg-[var(--secondary-bg)] text-[var(--foreground-secondary)]'
              }`}
            >
              Weekly Planner
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-2 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                activeTab === 'goals'
                  ? 'bg-[var(--accent-bg)] text-[var(--foreground)]'
                  : 'hover:bg-[var(--secondary-bg)] text-[var(--foreground-secondary)]'
              }`}
            >
              Goals
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
          </div>
        </div>
      </nav>
      <div className="p-4">
        {activeTab === 'goals' ? (
        <Goals 
          goals={muscleGoals}
          onGoalChange={setMuscleGoals} 
          muscleActivation={calculateTotalMuscleActivation()}
          weeklyPlan={weeklyPlan}
        />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Schedule and Graph */}
              <div className="lg:col-span-3 space-y-6">
                {/* Weekly Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 bg-[var(--secondary-bg)] p-2 md:p-4 rounded-lg">
                  {Object.entries(weeklyPlan).map(([day, dayExercises]) => (
                    <DragDropWrapper
                      key={day}
                      day={day}
                      exercises={dayExercises}
                      setsPerDay={muscleGoals.setsPerDay}
                      muscleFrequency={muscleGoals.muscleFrequency}
                      workoutDays={muscleGoals.workoutDays}
                      weeklyPlan={weeklyPlan}
                      muscleGoals={muscleGoals}
                      onAddExercise={() => {
                        setSelectedDay(day);
                        setIsExerciseModalOpen(true);
                      }}
                    >
                      <Droppable droppableId={day}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-2 min-h-full ${snapshot.isDraggingOver ? 'bg-[var(--accent-bg)]' : ''}`}
                          >
                            {dayExercises.map((exercise, index) => (
                              <Draggable
                                key={`${day}-${index}`}
                                draggableId={`${day}-${index}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transform: snapshot.isDragging
                                        ? provided.draggableProps.style?.transform
                                        : 'none',
                                    }}
                                  >
                                    <ExerciseCard
                                      exercise={exercise}
                                      index={index}
                                      removeExercise={() => removeExercise(day, index)}
                                      updateSets={(change) => updateSets(day, index, change)}
                                      currentDay={day}
                                      onMove={() => {
                                        setSelectedExercise(index);
                                        setSelectedExerciseDay(day);
                                        setIsDaySelectionModalOpen(true);
                                      }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropWrapper>
                  ))}
                </div>

                {/* Muscle Activation Chart */}
                <div className="h-[500px] md:h-96 bg-[var(--card-bg)] p-2 md:p-6 rounded-lg shadow-sm text-[var(--foreground)]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h2 className="text-xl font-semibold text-[var(--foreground)] px-1 md:px-0">Weekly Muscle Activation</h2>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => setSelectedDaysForGraph(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          selectedDaysForGraph.length === 7
                            ? 'bg-blue-500 text-white'
                            : 'bg-[var(--accent-bg)] text-[var(--foreground)] hover:bg-[var(--accent-hover)]'
                        }`}
                      >
                        All Days
                      </button>
                      {Object.keys(weeklyPlan).map(day => (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDaysForGraph(prev => {
                              if (prev.includes(day)) {
                                return prev.filter(d => d !== day);
                              }
                              return [...prev, day];
                            });
                          }}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            selectedDaysForGraph.includes(day)
                              ? 'bg-blue-500 text-white'
                              : 'bg-[var(--accent-bg)] text-[var(--foreground)] hover:bg-[var(--accent-hover)]'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={calculateTotalMuscleActivation()} margin={{ bottom: 40 }}>
                      <XAxis 
                        dataKey="muscle" 
                        angle={-90} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        width={35}
                        tickFormatter={(value) => Math.round(value)}
                      />
                      <Tooltip 
                        contentStyle={{
                          fontSize: '14px',
                          padding: '8px 12px',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--foreground)'
                        }}
                        cursor={{ fill: 'var(--accent-bg)' }}
                      />
                      <Bar 
                        dataKey="activation"
                        fill="#60A5FA"
                        fillOpacity={1}
                        minPointSize={5}
                        label={({ x, y, width, height, value, payload }) => {
                          if (!payload || !payload.muscle || !muscleGoals[payload.muscle]) return null;
                          const percentage = Math.round((value / muscleGoals[payload.muscle]) * 100);
                          return (
                            <text
                              x={x + width / 2}
                              y={y - 10}
                              fill="var(--foreground)"
                              textAnchor="middle"
                              fontSize={12}
                              dominantBaseline="middle"
                            >
                              {percentage}%
                            </text>
                          );
                        }}
                      >
                        {calculateTotalMuscleActivation().map((entry, index) => {
                          const goal = muscleGoals[entry.muscle];
                          const color = goal && goal > 0 && entry.activation >= goal ? '#22C55E' : '#60A5FA';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day Selection Modal */}
              <DaySelectionModal
                isOpen={isDaySelectionModalOpen}
                onClose={() => {
                  setIsDaySelectionModalOpen(false);
                  setSelectedExercise(null);
                  setSelectedExerciseDay(null);
                }}
                onSelectDay={(toDay) => {
                  moveExercise(selectedExerciseDay, toDay, selectedExercise);
                }}
                currentDay={selectedExerciseDay}
              />

              {/* Exercise Selection Modal */}
              <ExerciseModal
                isOpen={isExerciseModalOpen}
                onClose={() => {
                  setIsExerciseModalOpen(false);
                  setSelectedDay(null);
                }}
                onSelectExercise={(exercise) => {
                  if (selectedDay) {
                    const exerciseWithSets = { ...exercise, sets: 1 };
                    setWeeklyPlan(prev => ({
                      ...prev,
                      [selectedDay]: [...prev[selectedDay], exerciseWithSets]
                    }));
                  }
                }}
                exercises={exerciseData}
              />

              {/* Right Column - Exercise Library */}
              <div className="hidden lg:block lg:col-span-1 bg-[var(--secondary-bg)] p-4 rounded-lg overflow-y-auto max-h-[600px] lg:max-h-none">
                <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-[var(--secondary-bg)] pb-2 text-[var(--foreground)]">Exercise Library</h2>
                <Droppable droppableId="exercise-library" isDropDisabled={true}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                      {exerciseData.map((exercise, index) => (
                        <Draggable
                          key={`library-${index}`}
                          draggableId={`library-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-[var(--card-bg)] rounded-lg shadow-sm hover:shadow-md text-[var(--foreground)] transition-all ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              }`}
                            >
                              <p className="font-medium text-sm mb-2">{exercise.Exercise}</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(exercise)
                                  .filter(([key, value]) => key !== 'Exercise' && value > 0)
                                  .map(([muscle, value]) => (
                                    <span 
                                      key={muscle} 
                                      className="inline-block px-2 py-1 bg-[var(--accent-bg)] rounded text-xs text-[var(--foreground)] font-medium"
                                    >
                                      {muscle}: {value}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanner;

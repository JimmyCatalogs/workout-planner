'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { exerciseData } from '../data/exercises.js';
import Goals from './Goals';

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
const DragDropWrapper = ({ children, onDrop, onDragOver, day, exercises, setsPerDay }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalSets = exercises.reduce((total, exercise) => total + (exercise.sets || 1), 0);
  const isGoalReached = setsPerDay > 0 && totalSets >= setsPerDay;

  if (!isMounted) {
    return (
      <div className={`h-[384px] border-2 rounded-lg bg-[var(--card-bg)] shadow-sm ${
        isGoalReached ? 'border-green-500' : 'border-[var(--border-color)]'
      }`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`h-[384px] border-2 rounded-lg bg-[var(--card-bg)] shadow-sm ${
        isGoalReached ? 'border-green-500' : 'border-[var(--border-color)]'
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="flex justify-between items-center p-2 bg-[var(--accent-bg)] border-b border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--foreground)]">{day}</h3>
        <span className="text-sm text-[var(--foreground)]">{totalSets} sets</span>
      </div>
      <div className="overflow-y-auto h-[332px]">
        {children}
      </div>
    </div>
  );
};

const WorkoutPlanner = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [muscleGoals, setMuscleGoals] = useState({});
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
    
    Object.values(weeklyPlan).forEach(dayExercises => {
      dayExercises.forEach(exercise => {
        const sets = exercise.sets || 1;
        Object.keys(totals).forEach(muscle => {
          totals[muscle] += (exercise[muscle] || 0) * sets;
        });
      });
    });
    
    return Object.entries(totals).map(([name, value]) => ({
      muscle: name,
      activation: value
    }));
  };

  const handleDragStart = (e, exercise) => {
    if (!isMounted) return;
    e.dataTransfer.setData('exercise', JSON.stringify(exercise));
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    try {
      const exercise = JSON.parse(e.dataTransfer.getData('exercise'));
      // Add sets property when adding exercise
      const exerciseWithSets = { ...exercise, sets: 1 };
      setWeeklyPlan(prev => ({
        ...prev,
        [day]: [...prev[day], exerciseWithSets]
      }));
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
      <nav className="bg-[var(--card-bg)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'planner'
                  ? 'bg-[var(--accent-bg)] text-[var(--foreground)]'
                  : 'hover:bg-[var(--secondary-bg)] text-[var(--foreground-secondary)]'
              }`}
            >
              Weekly Planner
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'goals'
                  ? 'bg-[var(--accent-bg)] text-[var(--foreground)]'
                  : 'hover:bg-[var(--secondary-bg)] text-[var(--foreground-secondary)]'
              }`}
            >
              Goals
            </button>
          </div>
          <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        </div>
      </nav>
      <div className="p-4">
        {activeTab === 'goals' ? (
        <Goals 
          goals={muscleGoals}
          onGoalChange={setMuscleGoals} 
          muscleActivation={calculateTotalMuscleActivation()} 
        />
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {/* Left Column - Schedule and Graph */}
            <div className="col-span-3 space-y-6">
              {/* Weekly Schedule */}
              <div className="grid grid-cols-7 gap-4 bg-[var(--secondary-bg)] p-4 rounded-lg">
                {Object.entries(weeklyPlan).map(([day, dayExercises]) => (
                  <DragDropWrapper
                    key={day}
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                    day={day}
                    exercises={dayExercises}
                    setsPerDay={muscleGoals.setsPerDay}
                  >
                    <div className="p-2">
                      {dayExercises.map((exercise, index) => (
                        <div key={index} className="p-2 mb-2 bg-[var(--accent-bg)] rounded text-sm text-[var(--foreground)]">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span>{exercise.Exercise}</span>
                            <button
                              onClick={() => removeExercise(day, index)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <button
                              onClick={() => updateSets(day, index, -1)}
                              className="px-2 py-1 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover)] rounded"
                            >
                              -
                            </button>
                            <span className="font-medium">{exercise.sets || 1} sets</span>
                            <button
                              onClick={() => updateSets(day, index, 1)}
                              className="px-2 py-1 bg-[var(--accent-bg)] hover:bg-[var(--accent-hover)] rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DragDropWrapper>
                ))}
              </div>

              {/* Muscle Activation Chart */}
              <div className="h-96 bg-[var(--card-bg)] p-4 rounded-lg shadow-sm text-[var(--foreground)]">
                <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Weekly Muscle Activation</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={calculateTotalMuscleActivation()}>
                    <XAxis dataKey="muscle" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="activation"
                      fill="#60A5FA"
                      fillOpacity={1}
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

            {/* Right Column - Exercise Library */}
            <div className="col-span-1 bg-[var(--secondary-bg)] p-4 rounded-lg overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-[var(--secondary-bg)] pb-2 text-[var(--foreground)]">Exercise Library</h2>
              <div className="space-y-4">
                {exerciseData.map((exercise, index) => (
                  <div
                    key={index}
                    draggable={isMounted}
                    onDragStart={(e) => handleDragStart(e, exercise)}
                    className="p-3 bg-[var(--card-bg)] rounded-lg cursor-move hover:bg-[var(--accent-bg)] transition-colors shadow-sm text-[var(--foreground)]"
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanner;
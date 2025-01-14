'use client';
import React, { useState, useEffect } from 'react';

const PRESETS = {
  light: { sets: 10, activation: 20 },
  moderate: { sets: 15, activation: 40 },
  intense: { sets: 20, activation: 60 }
};

const PresetSelect = ({ onSelect, selectedPreset }) => (
  <select
    value={selectedPreset}
    onChange={(e) => onSelect(e.target.value)}
    className="w-full md:w-auto px-2 py-1 rounded text-sm bg-[var(--background)] text-[var(--foreground)] border border-[var(--border-color)]"
  >
    {Object.keys(PRESETS).map((preset) => (
      <option key={preset} value={preset}>
        {preset.charAt(0).toUpperCase() + preset.slice(1)}
      </option>
    ))}
  </select>
);

const Goals = ({ goals, onGoalChange, muscleActivation, weeklyPlan }) => {
  const [selectedSetsPreset, setSelectedSetsPreset] = useState('moderate');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [musclePresets, setMusclePresets] = useState({
    Chest: 'moderate',
    Back: 'moderate',
    Shoulders: 'moderate',
    Biceps: 'moderate',
    Triceps: 'moderate',
    Quadriceps: 'moderate',
    Hamstrings: 'moderate',
    Glutes: 'moderate',
    Calves: 'moderate',
    Abs: 'moderate'
  });

  useEffect(() => {
    // Set default moderate values if goals are empty
    if (Object.keys(goals).length === 0) {
      const defaultGoals = {
        setsPerDay: PRESETS.moderate.sets,
        Chest: PRESETS.moderate.activation,
        Back: PRESETS.moderate.activation,
        Shoulders: PRESETS.moderate.activation,
        Biceps: PRESETS.moderate.activation,
        Triceps: PRESETS.moderate.activation,
        Quadriceps: PRESETS.moderate.activation,
        Hamstrings: PRESETS.moderate.activation,
        Glutes: PRESETS.moderate.activation,
        Calves: PRESETS.moderate.activation,
        Abs: PRESETS.moderate.activation
      };
      onGoalChange(defaultGoals);
    }
  }, []);

  const handleGoalChange = (muscle, value) => {
    onGoalChange({
      ...goals,
      [muscle]: Math.max(0, parseInt(value) || 0)
    });
  };

  const handleSetsPerDayChange = (value) => {
    onGoalChange({
      ...goals,
      setsPerDay: Math.max(0, parseInt(value) || 0)
    });
  };

  const handleSetsPresetSelect = (preset) => {
    setSelectedSetsPreset(preset);
    onGoalChange({
      ...goals,
      setsPerDay: PRESETS[preset].sets
    });
  };

  const handleMusclePresetSelect = (muscle, preset) => {
    setMusclePresets(prev => ({
      ...prev,
      [muscle]: preset
    }));
    onGoalChange({
      ...goals,
      [muscle]: PRESETS[preset].activation
    });
  };

  return (
    <div className="p-2 md:p-4 bg-[var(--secondary-bg)] rounded-lg space-y-6">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Your Fitness Goal</h2>
        <div className="p-3 md:p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
          <textarea
            value={fitnessGoal}
            onChange={(e) => setFitnessGoal(e.target.value)}
            placeholder="I am 44 years old and my objective is to gain 20lbs of muscle mass in 2 years, show me a workout plan"
            className="w-full px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] min-h-[100px]"
          />
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={async () => {
                setIsProcessing(true);
                setStatusMessage('Processing your request...');
                
                try {
                  // Here we would send the request to Claude with the current goals as context
                  const response = await fetch('/api/generate-goals', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      fitnessGoal,
                      currentGoals: goals
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to generate goals');
                  }

                  const newGoals = await response.json();
                  onGoalChange(newGoals);
                  setStatusMessage('Goals updated successfully!');
                  
                  // Create a formatted message showing the updated values
                  const updatedValuesMessage = `Based on your input, we have updated your goals to:
• Sets per day: ${newGoals.setsPerDay}
• Muscle activation targets:
  - Chest: ${newGoals.Chest}
  - Back: ${newGoals.Back}
  - Shoulders: ${newGoals.Shoulders}
  - Biceps: ${newGoals.Biceps}
  - Triceps: ${newGoals.Triceps}
  - Quadriceps: ${newGoals.Quadriceps}
  - Hamstrings: ${newGoals.Hamstrings}
  - Glutes: ${newGoals.Glutes}
  - Calves: ${newGoals.Calves}
  - Abs: ${newGoals.Abs}`;
                  
                  setResponseMessage(updatedValuesMessage);
                } catch (error) {
                  setStatusMessage('Failed to update goals. Please try again.');
                } finally {
                  setIsProcessing(false);
                }
              }}
              disabled={isProcessing || !fitnessGoal.trim()}
              className={`px-4 py-2 rounded ${
                isProcessing || !fitnessGoal.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              {isProcessing ? 'Processing...' : 'Update Goals'}
            </button>
            {statusMessage && (
              <span className={`text-sm ${
                statusMessage.includes('success') ? 'text-green-500' : 
                statusMessage.includes('Failed') ? 'text-red-500' : 
                'text-[var(--foreground)]'
              }`}>
                {statusMessage}
              </span>
            )}
          </div>
          {responseMessage && (
            <div className="mt-4 p-3 bg-[var(--background)] rounded border border-[var(--border-color)] whitespace-pre-line text-sm">
              {responseMessage}
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Workout Goals</h2>
        <div className="p-3 md:p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Max sets per day
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="number"
                  min="0"
                  value={goals.setsPerDay || 0}
                  onChange={(e) => handleSetsPerDayChange(e.target.value)}
                  className="w-20 md:w-24 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-xs md:text-sm text-[var(--foreground-secondary)]">Preset:</span>
                <PresetSelect
                  onSelect={handleSetsPresetSelect}
                  selectedPreset={selectedSetsPreset}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Target muscle group frequency (times per week)
            </label>
            <input
              type="number"
              min="0"
              max="7"
              value={goals.muscleFrequency || 2}
              onChange={(e) => handleGoalChange('muscleFrequency', e.target.value)}
              className="w-20 md:w-24 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Target workout days per week
            </label>
            <input
              type="number"
              min="0"
              max="7"
              value={goals.workoutDays || 0}
              onChange={(e) => handleGoalChange('workoutDays', e.target.value)}
              className="w-20 md:w-24 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Weekly Muscle Activation Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries({
          Chest: goals.Chest || 0,
          Back: goals.Back || 0,
          Shoulders: goals.Shoulders || 0,
          Biceps: goals.Biceps || 0,
          Triceps: goals.Triceps || 0,
          Quadriceps: goals.Quadriceps || 0,
          Hamstrings: goals.Hamstrings || 0,
          Glutes: goals.Glutes || 0,
          Calves: goals.Calves || 0,
          Abs: goals.Abs || 0
        }).map(([muscle, goal]) => {
          const currentActivation = muscleActivation.find(m => m.muscle === muscle)?.activation || 0;
          const muscleFrequency = goals.muscleFrequency || 2;
          const weeklyGoal = goal || 0;
          const dailyLimit = weeklyGoal / muscleFrequency;
          
          // Calculate status
          let status = 'none';
          let statusText = '';
          
          if (weeklyGoal > 0) {
            if (currentActivation >= weeklyGoal) {
              const exceedsLimit = Object.values(weeklyPlan).some(dayExercises => {
                const dayActivation = dayExercises.reduce((total, exercise) => {
                  const sets = exercise.sets || 1;
                  return total + (exercise[muscle] || 0) * sets;
                }, 0);
                return dayActivation > dailyLimit;
              });
              
              status = exceedsLimit ? 'warning' : 'success';
              statusText = exceedsLimit ? 'Daily limit exceeded' : `Target reached (${currentActivation}/${weeklyGoal})`;
            } else {
              status = 'error';
              statusText = `Below target (${currentActivation}/${weeklyGoal})`;
            }
          }
          
          return (
            <div 
              key={muscle} 
              className={`p-3 md:p-4 bg-[var(--card-bg)] rounded-lg ${
                status === 'success' ? 'border-2 border-green-500' :
                status === 'warning' ? 'border-2 border-yellow-500' :
                status === 'error' ? 'border-2 border-red-500' :
                'border border-[var(--border-color)]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  {muscle}
                </label>
                {status !== 'none' && (
                  <span className={`text-xs ${
                    status === 'success' ? 'text-green-500' :
                    status === 'warning' ? 'text-yellow-600' :
                    'text-red-500'
                  }`}>
                    {status === 'success' ? '✓' :
                     status === 'warning' ? '⚠' :
                     '✕'}
                  </span>
                )}
              </div>
              {statusText && (
                <div className={`text-xs mb-2 ${
                  status === 'success' ? 'text-green-500' :
                  status === 'warning' ? 'text-yellow-600' :
                  'text-red-500'
                }`}>
                  {statusText}
                </div>
              )}
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={goal}
                    onChange={(e) => handleGoalChange(muscle, e.target.value)}
                    className="w-20 md:w-24 px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)]"
                  />
                  <span className="text-xs md:text-sm text-[var(--foreground)]">
                    Current: {currentActivation}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="text-xs md:text-sm text-[var(--foreground-secondary)]">Preset:</span>
                  <PresetSelect
                    onSelect={(preset) => handleMusclePresetSelect(muscle, preset)}
                    selectedPreset={musclePresets[muscle]}
                  />
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default Goals;

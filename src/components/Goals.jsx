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

const Goals = ({ goals, onGoalChange, muscleActivation }) => {
  const [selectedSetsPreset, setSelectedSetsPreset] = useState('moderate');
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
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-[var(--foreground)]">Daily Sets Goal</h2>
        <div className="p-3 md:p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Sets per day
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
          const isGoalReached = goal > 0 && currentActivation >= goal;
          
          return (
            <div 
              key={muscle} 
              className={`p-3 md:p-4 bg-[var(--card-bg)] rounded-lg ${
                isGoalReached ? 'border-2 border-green-500' : 'border border-[var(--border-color)]'
              }`}
            >
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {muscle}
              </label>
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

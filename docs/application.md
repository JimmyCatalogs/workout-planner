# Workout Planner Application Documentation

## Overview
The Workout Planner is a Next.js-based web application that helps users create and manage their weekly workout routines. It features a drag-and-drop interface for exercise planning and provides visual feedback on muscle activation throughout the week.

## Features

### 1. Weekly Schedule
- Interactive 7-day workout calendar (Monday through Sunday)
- Drag-and-drop functionality for adding exercises to specific days
- Ability to remove exercises from the schedule
- Set management for each exercise (increment/decrement number of sets)

### 2. Exercise Library
- Comprehensive collection of 21 common exercises
- Each exercise includes muscle activation ratings (scale of 0-5) for:
  - Upper body: Chest, Back, Shoulders, Biceps, Triceps
  - Lower body: Quadriceps, Hamstrings, Glutes, Calves
  - Core: Abs
- Visual representation of muscle activation levels for each exercise

### 3. Muscle Activation Analytics
- Real-time bar chart visualization of weekly muscle activation
- Tracks cumulative activation across all muscle groups
- Takes into account number of sets for each exercise
- Helps identify imbalances in workout routine

## Technical Implementation

### Architecture
- Built with Next.js and React
- Uses client-side rendering for drag-and-drop functionality
- Implements Recharts for data visualization
- Styled with Tailwind CSS

### Key Components

#### WorkoutPlanner.jsx
- Main component handling the application logic
- Manages weekly plan state
- Implements drag-and-drop functionality
- Calculates muscle activation totals
- Renders the weekly schedule and exercise library

#### DragDropWrapper
- Client-side wrapper component for drag-and-drop functionality
- Handles hydration mismatch between server and client rendering
- Provides consistent UI during initial load

### Data Structure

#### Exercise Data (exercises.js)
```javascript
{
  id: number,
  Exercise: string,
  Chest: number (0-5),
  Back: number (0-5),
  Shoulders: number (0-5),
  Biceps: number (0-5),
  Triceps: number (0-5),
  Quadriceps: number (0-5),
  Hamstrings: number (0-5),
  Glutes: number (0-5),
  Calves: number (0-5),
  Abs: number (0-5)
}
```

#### Weekly Plan State Structure
```javascript
{
  Monday: Exercise[],
  Tuesday: Exercise[],
  Wednesday: Exercise[],
  Thursday: Exercise[],
  Friday: Exercise[],
  Saturday: Exercise[],
  Sunday: Exercise[]
}
```

## User Interface

### Layout
- Responsive grid layout with 4 columns
- Left section (3 columns):
  - Weekly schedule grid
  - Muscle activation chart
- Right section (1 column):
  - Exercise library

### Interactive Elements
1. Exercise Cards
   - Draggable elements
   - Display exercise name and muscle activation indicators
   - Set controls (+/- buttons)
   - Remove button (×)

2. Day Containers
   - Drop zones for exercises
   - Scrollable when containing multiple exercises
   - Clear visual hierarchy with day labels

3. Muscle Activation Chart
   - Bar chart showing weekly totals
   - Interactive tooltips
   - Angled labels for better readability

## Usage Tips
1. Plan workouts by dragging exercises from the library to specific days
2. Adjust sets using the +/- controls on each exercise
3. Monitor muscle activation balance using the chart
4. Remove exercises by clicking the × button
5. Use the scrollable containers when adding multiple exercises to a day

## Best Practices
1. Balance muscle group activation across the week
2. Allow adequate rest between similar muscle group workouts
3. Consider exercise intensity when planning multiple sets
4. Use the muscle activation chart to ensure comprehensive coverage
5. Plan rest days strategically within the weekly schedule

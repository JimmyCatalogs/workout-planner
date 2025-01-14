# Workout Planner Application Documentation

## Overview
The Workout Planner is a Next.js-based web application that helps users create and manage their weekly workout routines. It features a drag-and-drop interface for exercise planning, provides visual feedback on muscle activation throughout the week, and includes AI-powered workout goal recommendations.

## Features

### 1. Authentication
- Secure user authentication powered by Clerk
- Sign-in and sign-up functionality
- Protected routes and user-specific data

### 2. Weekly Schedule
- Interactive 7-day workout calendar (Monday through Sunday)
- Drag-and-drop functionality for adding exercises to specific days
- Ability to remove exercises from the schedule
- Set management for each exercise (increment/decrement number of sets)

### 3. Exercise Library
- Comprehensive collection of 21 common exercises
- Each exercise includes muscle activation ratings (scale of 0-5) for:
  - Upper body: Chest, Back, Shoulders, Biceps, Triceps
  - Lower body: Quadriceps, Hamstrings, Glutes, Calves
  - Core: Abs
- Visual representation of muscle activation levels for each exercise

### 4. Muscle Activation Analytics
- Real-time bar chart visualization of weekly muscle activation
- Tracks cumulative activation across all muscle groups
- Takes into account number of sets for each exercise
- Helps identify imbalances in workout routine

### 5. Smart Goal Setting
- AI-powered workout goal recommendations
- Natural language input for fitness goals
- Customizable workout intensity presets (light, moderate, intense)
- Goal tracking for:
  - Maximum sets per day
  - Target muscle group frequency
  - Weekly muscle activation targets
  - Workout days per week
- Real-time goal progress monitoring
- Visual status indicators for goal achievement

## Technical Implementation

### Architecture
- Built with Next.js and React
- Uses client-side rendering for drag-and-drop functionality
- Implements Recharts for data visualization
- Styled with Tailwind CSS
- Clerk authentication integration
- Claude AI integration for goal recommendations

### Key Components

#### WorkoutPlanner.jsx
- Main component handling the application logic
- Manages weekly plan state
- Implements drag-and-drop functionality
- Calculates muscle activation totals
- Renders the weekly schedule and exercise library

#### Goals.jsx
- Manages workout goals and targets
- Handles AI-powered goal generation
- Provides preset intensity selections
- Tracks goal progress and status
- Displays visual feedback on goal achievement

#### Authentication Pages
- Sign-in and sign-up pages using Clerk components
- Protected route handling
- User session management

### API Routes

#### /api/generate-goals
- Processes natural language fitness goals
- Integrates with Claude AI for intelligent goal recommendations
- Returns structured workout targets based on user input
- Handles goal intensity calibration

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

#### Goals State Structure
```javascript
{
  setsPerDay: number,
  muscleFrequency: number,
  workoutDays: number,
  Chest: number,
  Back: number,
  Shoulders: number,
  Biceps: number,
  Triceps: number,
  Quadriceps: number,
  Hamstrings: number,
  Glutes: number,
  Calves: number,
  Abs: number
}
```

## User Interface

### Layout
- Responsive grid layout with 4 columns
- Left section (3 columns):
  - Weekly schedule grid
  - Muscle activation chart
  - Goals and targets panel
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

4. Goals Panel
   - Natural language goal input
   - Intensity preset selectors
   - Progress indicators
   - Visual status feedback
   - AI-powered recommendations

## Usage Tips
1. Plan workouts by dragging exercises from the library to specific days
2. Adjust sets using the +/- controls on each exercise
3. Monitor muscle activation balance using the chart
4. Remove exercises by clicking the × button
5. Use the scrollable containers when adding multiple exercises to a day
6. Input your fitness goals in natural language for AI recommendations
7. Use intensity presets to quickly adjust targets
8. Monitor goal progress through visual indicators

## Best Practices
1. Balance muscle group activation across the week
2. Allow adequate rest between similar muscle group workouts
3. Consider exercise intensity when planning multiple sets
4. Use the muscle activation chart to ensure comprehensive coverage
5. Plan rest days strategically within the weekly schedule
6. Set realistic goals based on your fitness level
7. Regularly update your goals as you progress
8. Use the AI recommendations as a starting point and adjust based on your needs

# Pomodoro Timer

A simple, responsive pomodoro timer web app built with Next.js and TypeScript. Features customizable work and break intervals with persistent settings.

## Features

- 🍅 **Customizable Intervals**: Set work duration (1-99 minutes) and break duration (1-99 minutes)
- 💾 **Persistent Settings**: Settings are saved to localStorage and persist across browser sessions
- 📱 **Mobile Responsive**: Optimized for both desktop and mobile devices
- ✅ **Input Validation**: Comprehensive validation with user-friendly error messages
- 🎨 **Modern UI**: Clean, gradient-based design with smooth animations
- ♿ **Accessibility**: Full keyboard navigation and screen reader support

## Implementation Details

### Settings Panel Features

The settings panel implements all required acceptance criteria:

1. **Settings Display**: Opens with current work and break durations from localStorage
2. **Valid Input Handling**: Accepts values from 1-99 minutes and persists to localStorage
3. **Invalid Input Validation**: Shows errors for values ≤0 or ≥100 minutes
4. **Non-numeric Input Validation**: Displays error messages for invalid input
5. **Cancel Functionality**: Cancel button closes panel without saving changes
6. **Session Integration**: New sessions automatically use updated durations
7. **Mobile Support**: Displays as full-width overlay on mobile viewports

### Project Structure

```
├── components/
│   ├── SettingsPanel.tsx    # Main settings panel component
│   └── Timer.tsx            # Pomodoro timer component
├── hooks/
│   └── useSettings.ts       # localStorage settings management
├── pages/
│   ├── _app.tsx             # Next.js app wrapper
│   ├── _document.tsx        # HTML document structure
│   └── index.tsx            # Main application page
├── styles/
│   ├── globals.css          # Global styles
│   ├── Home.module.css      # Homepage styles
│   ├── SettingsPanel.module.css  # Settings panel styles
│   └── Timer.module.css     # Timer component styles
└── utils/
    └── validation.ts        # Validation utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pomodoro-timer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Usage

1. **Start Timer**: Click the "Start" button to begin a work session
2. **Pause/Resume**: Use the pause button to temporarily stop the timer
3. **Reset**: Reset the current session back to the beginning
4. **Switch Modes**: Manually switch between work and break sessions
5. **Settings**: Click the settings button (⚙️) to customize durations

### Settings Panel

- **Work Duration**: Set the length of work sessions (1-99 minutes)
- **Break Duration**: Set the length of break sessions (1-99 minutes)
- **Save**: Apply and persist settings
- **Cancel**: Close without saving changes

### Input Validation

The settings panel validates input and shows helpful error messages:
- Empty fields show "Field is required"
- Non-numeric input shows "Must be a whole number"
- Values ≤0 show "Must be greater than 0"
- Values ≥100 show "Must be less than 100"

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Decisions

- **Next.js**: Provides excellent developer experience and built-in optimizations
- **TypeScript**: Ensures type safety and better developer experience
- **CSS Modules**: Scoped styling prevents conflicts and improves maintainability
- **localStorage**: Simple, client-side persistence for settings
- **Custom Hooks**: Reusable logic for settings management
- **Mobile-First**: Responsive design that works great on all screen sizes

## Testing

Basic validation testing:
```bash
node test-validation.js
```

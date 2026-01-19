# Random Wake

A smart alarm app that wakes you up at random times within your specified range, featuring task-based dismissal to ensure you're fully awake.

## Features

- **Random Wake Times** - Set a time range and wake up at a random time within it
- **Task-Based Dismissal** - Solve math problems, shake your phone, type text, or complete sequences to turn off the alarm
- **Multiple Alarm Support** - Create and manage multiple alarms with different settings
- **Day Selection** - Choose specific days for each alarm
- **Custom Sounds** - Select from various alarm sounds
- **Statistics Tracking** - Track your wake-up performance over time
- **Multi-language** - Support for English and Turkish

## Tech Stack

- **React Native** with Expo
- **TypeScript**
- **Expo Router** for navigation
- **Zustand** for state management
- **expo-notifications** for alarm notifications

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/umutverne/random-wake.git

# Navigate to project directory
cd random-wake

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Building

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Project Structure

```
random-wake/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── alarm/             # Alarm management screens
│   └── task/              # Task screens (math, shake, etc.)
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic services
│   ├── stores/            # Zustand state stores
│   ├── i18n/              # Internationalization
│   └── theme/             # Theme configuration
└── assets/                # Images and sounds
```

## License

MIT

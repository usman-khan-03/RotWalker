# RotWalker

Turn your steps into epic journeys.

A cross-platform mobile app (iOS and Android) that gamifies step tracking with solo journeys, group journeys, and weekly competitive seasons.

## Features

- **Solo Journeys**: Choose origin and destination cities, convert steps to distance on a map
- **Crew Journeys**: Collaborate with friends to reach goal cities (minimum 50 miles)
- **Weekly Seasons**: Competitive 1v1 crew matchups with global leaderboards
- **Friends Leaderboard**: Compare your progress with friends
- **Step Tracking**: Device pedometer integration with optional Health app sync

## Tech Stack

- **React Native** with **Expo** (TypeScript)
- **React Navigation** (Stack + Bottom Tabs)
- **React Query** (TanStack Query) for data fetching
- **Supabase** for backend (Auth, Database, Edge Functions)
- **React Native Maps** for journey visualization

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RotWalker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
```

5. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

## Project Structure

```
src/
├── api/              # Supabase client and API wrappers
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── navigation/      # React Navigation setup
├── screens/         # Screen components
│   ├── auth/        # Welcome, Login, Onboarding
│   ├── home/        # Home dashboard
│   ├── friends/     # Friends and leaderboard
│   ├── crews/       # Crew management
│   └── profile/     # User profile and settings
├── theme/           # Theme system (colors, typography, spacing)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Supabase Setup

### Database Schema

The app expects the following tables in Supabase:

- `profiles` - User profiles
- `friendships` - Friend relationships
- `crews` - Crew groups
- `crew_members` - Crew membership
- `journeys` - Solo and crew journeys
- `journey_progress` - Daily progress tracking
- `daily_steps` - Daily step counts
- `seasons` - Weekly season data
- `season_crews` - Crew participation in seasons
- `notifications` - In-app notifications

### Edge Functions

The app calls the following Edge Functions (stubs included, implement as needed):

- `sync_steps_data` - Sync step data from device
- `get_home_summary` - Get home dashboard data
- `get_friends_leaderboard` - Get friends leaderboard
- `get_crew_detail` - Get crew details

See `src/api/edgeFunctions.ts` for function signatures.

### Authentication

The app uses Supabase Auth with Google Sign-In. Configure Google OAuth in your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Google provider
3. Add your OAuth credentials
4. Set redirect URL: `rotwalker://auth/callback`

## Development

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- React Query for server state
- Context API for app-wide state

### Theme System

The app uses a centralized theme system (`src/theme/theme.ts`):

- **Colors**: Dark theme with mode-specific primaries
  - Solo: Indigo (#6366F1)
  - Crew: Green (#22C55E)
  - Season: Orange (#F97316)
- **Typography**: Consistent text styles
- **Spacing**: Standardized spacing scale
- **Border Radius**: Consistent rounded corners

## Key Features Implementation

### Step Tracking

Step tracking is implemented via hooks (`src/hooks/useSteps.ts`). Currently uses stubs - integrate with:

- iOS: Core Motion (via expo-sensors or react-native-pedometer)
- Android: Step Counter sensor (via expo-sensors)
- Optional: Apple Health / Health Connect for backfilling

### Journey Distance Validation

Crew journeys must be at least 50 miles (80 km). Validation is implemented in `src/utils/distance.ts`.

### Season Schedule

- Seasons run Monday to Saturday
- Sunday is rest/preview day
- 1v1 matching happens automatically when season starts
- Global leaderboard shows top 10 + user's crew(s)

## TODO / Next Steps

- [ ] Implement actual step tracking (pedometer integration)
- [ ] Implement Supabase Edge Functions
- [ ] Add journey creation flow
- [ ] Add crew creation flow
- [ ] Implement friend request system
- [ ] Add push notifications
- [ ] Implement season matching algorithm
- [ ] Add map search for city selection
- [ ] Add widget support (iOS/Android)

## License

[Your License Here]

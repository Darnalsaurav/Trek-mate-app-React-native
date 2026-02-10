# TrekMate Mobile - React Native App

This is the React Native version of the TrekMate web application, converted to run on iOS and Android devices using Expo.

## 🚀 Project Structure

```
trekmate-mobile/
├── assets/                  # Images and static assets
├── src/
│   ├── components/          # All React Native components
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   ├── WelcomeScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ExploreScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── PlanTripScreen.js
│   │   └── ...
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.js
│   ├── config/              # App configuration
│   │   └── firebase.js
│   └── utils/               # Utility functions
│       └── destinationStore.js
├── App.js                   # Main app entry point
└── package.json

```

## ✨ Features Converted

### ✅ Completed
- **Splash Screen** with animated logo
- **Authentication** (Login & Sign Up with Firebase)
- **Onboarding Flow** (4 screens: Welcome, Find Mates, Plan Trips, Find Routes)
- **Bottom Tab Navigation** (Home, Explore, Messages, Profile)
- **Home Screen** with recommended destinations and upcoming treks
- **Explore Screen** with destination cards
- **Plan Trip Screen** with image upload functionality
- **Profile Screen** with logout
- **Firebase Integration** (Auth & Firestore)

### 🔄 Converted from React Web
- All HTML → React Native components (`View`, `Text`, `Image`, etc.)
- All CSS → React Native StyleSheet
- Custom navigation → React Navigation
- lucide-react icons → @expo/vector-icons
- Web forms → Native input components

## 📱 Running the App

### Prerequisites
- Node.js installed
- Expo Go app on your phone (for testing)
- OR iOS Simulator / Android Emulator

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "c:\React Projects\trek mate 1\trekmate-mobile"
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - **iOS Simulator:** Press `i`
   - **Android Emulator:** Press `a`
   - **Physical Device:** Scan the QR code with Expo Go app

## 🔥 Firebase Configuration

The Firebase configuration is already set up in `src/config/firebase.js` using the same credentials from your web app.

## 🎨 Key Differences from Web Version

1. **Navigation:**
   - Web: Custom state-based navigation
   - Mobile: React Navigation (Stack + Bottom Tabs)

2. **Styling:**
   - Web: CSS files
   - Mobile: StyleSheet objects

3. **Components:**
   - Web: HTML elements (`<div>`, `<button>`, etc.)
   - Mobile: React Native components (`<View>`, `<TouchableOpacity>`, etc.)

4. **Icons:**
   - Web: lucide-react
   - Mobile: @expo/vector-icons (Ionicons)

5. **Images:**
   - Web: Direct image imports
   - Mobile: `require()` for local, `{ uri }` for remote

## 📋 Future Enhancements

- Complete Messages/Chat functionality
- Map integration with React Native Maps
- Push notifications
- Camera integration for trip photos
- Offline support
- Performance optimizations

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation solution
- **Firebase** - Authentication & Database
- **Expo Vector Icons** - Icon library
- **Expo Image Picker** - Image selection
- **Expo Linear Gradient** - Gradient backgrounds

## 📝 Notes

- The web version is still available in the `trekmate` folder
- Both versions share the same Firebase backend
- User accounts work across both platforms
- Destination data is synced via the shared Firebase Firestore

## 🐛 Troubleshooting

If you encounter issues:

1. **Clear cache:**
   ```bash
   npm start -- --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check Expo Go app** is up to date on your device

---

**Happy Trekking! 🏔️**

# 🍒 Cherry Picked Mobile - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g @expo/cli`
- **Git** for version control

### Development Environment
For **iOS development**:
- macOS required
- Xcode (latest version)
- iOS Simulator

For **Android development**:
- Android Studio
- Android SDK
- Android Virtual Device (AVD)

## 🚀 Quick Start

### 1. Clone & Install
```bash
# Clone the repository
git clone [your-repo-url] cherry-picked-mobile
cd cherry-picked-mobile

# Install dependencies
npm install
```

### 2. Backend Setup
Ensure the Cherry Picked backend is running:
```bash
# In your backend directory (../cherry-picked/)
npm install
node server.js

# Backend should be running on http://localhost:3001
```

### 3. Start Development Server
```bash
# Start Expo development server
npm start

# This will open Expo DevTools in your browser
```

### 4. Run on Device/Simulator

#### Using Expo Go (Easiest)
1. Install **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Scan the QR code from your terminal/browser
3. App will load on your device

#### Using Simulators
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Backend Connection
- The mobile app connects to the backend at `localhost:3001`
- Make sure your backend server is running before testing
- For physical device testing, you may need to update the IP address

## 📱 Testing on Physical Devices

### iOS Device
1. Join the Apple Developer Program (required for device testing)
2. Use `npm run ios` to build and install on connected device
3. Or use Expo Go app for development testing

### Android Device
1. Enable Developer Options and USB Debugging
2. Use `npm run android` to build and install
3. Or use Expo Go app for development testing

## 🏗️ Building for Production

### Install EAS CLI
```bash
npm install -g @expo/eas-cli
eas login
```

### Development Builds
```bash
# Build for development testing
eas build --profile development --platform all
```

### Production Builds
```bash
# iOS App Store
npm run build:ios

# Google Play Store  
npm run build:android

# Both platforms
npm run build:all
```

### App Store Submission
```bash
# Submit to iOS App Store
npm run submit:ios

# Submit to Google Play Store
npm run submit:android
```

## 🔍 Development Tips

### Debugging
- Use **React DevTools** for component debugging
- **Flipper** for advanced debugging (network, logs, etc.)
- **Chrome DevTools** for web version debugging

### Hot Reloading
- Changes to JavaScript files auto-reload
- For native code changes, restart the app
- Use `r` in terminal to reload manually

### Common Issues

#### Network Errors
- Ensure backend is running on `localhost:3001`
- For physical devices, use your computer's IP address instead of `localhost`
- Check firewall settings

#### Build Errors
- Clear cache: `expo r -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

## 📁 Project Structure

```
cherry-picked-mobile/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── src/
│   ├── screens/          # All app screens
│   │   ├── LoginScreen.js
│   │   ├── SalesScreen.js
│   │   ├── StyleProfileScreen.js
│   │   └── ...
│   ├── components/       # Reusable components (future)
│   ├── services/         # API services (future)
│   └── styles/          # Global styles (future)
└── assets/              # Images, icons, fonts
```

## 🎨 Design System

### Colors
- **Primary**: Burgundy (#800020)
- **Light Burgundy**: rgba(128, 0, 32, 0.1-0.8)
- **Background**: White (#FFFFFF)  
- **Text**: Black (#000000)

### Typography
- System fonts (San Francisco on iOS, Roboto on Android)
- Consistent sizing: 12px, 14px, 16px, 18px, 20px, 24px, 28px

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Update version in `app.json` and `package.json`
- [ ] Test on both iOS and Android
- [ ] Verify all API endpoints work
- [ ] Test push notifications
- [ ] Check app icons and splash screens
- [ ] Update store descriptions and screenshots

### Store Requirements
- [ ] iOS: App Store assets (screenshots, description, keywords)
- [ ] Android: Play Store assets (screenshots, description, feature graphic)
- [ ] Privacy policy URL
- [ ] Terms of service URL

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and test thoroughly
3. Follow the existing code style and patterns
4. Update this guide if you add new setup steps
5. Submit a pull request

## 📞 Support

### Getting Help
- Check the [Expo Documentation](https://docs.expo.dev/)
- React Native [Community Guides](https://reactnative.dev/docs/getting-started)
- Stack Overflow with `expo` and `react-native` tags

### Common Resources
- [Expo Snack](https://snack.expo.dev/) - Online React Native playground
- [React Navigation Docs](https://reactnavigation.org/) - Navigation library
- [AsyncStorage Docs](https://react-native-async-storage.github.io/) - Local storage

---

**Happy coding! 🍒✨**

For questions about this mobile app, contact the development team or create an issue in the repository. 
# 🍒 Cherry Picked Mobile

React Native mobile application for Cherry Picked - Your personalized fashion sale discovery platform.

## 📱 About

Cherry Picked Mobile brings the full Cherry Picked experience to iOS and Android devices, featuring:

- **Personalized Sale Recommendations**: AI-powered suggestions based on your style profile
- **Style Profile Management**: Upload Pinterest screenshots to define your aesthetic
- **Social Features**: Connect with friends, share brands, and chat about fashion
- **Real-time Notifications**: Get instant alerts when your favorite brands go on sale
- **Forum Integration**: Share outfit inspirations and discover new trends
- **Cross-platform Compatibility**: Works seamlessly on both iOS and Android

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone https://github.com/[your-username]/cherry-picked-mobile.git
cd cherry-picked-mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device/Simulator

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

## 📋 Features

### 🛍️ Sales Discovery
- Browse curated sales from 35+ premium fashion brands
- Filter by categories: AI Picks, percentage discounts, special offers
- Save favorite brands for personalized notifications

### 🎨 Style Profile
- Upload Pinterest homepage screenshots for style analysis
- Add direct image URLs to build your aesthetic profile
- AI analyzes your preferences for better recommendations

### 👥 Social Network
- Add friends by email address
- View friends' favorite brands
- Chat about specific brands and share recommendations
- Privacy controls for brand visibility

### 📝 Fashion Forum
- Share outfit inspirations with photos
- Tag brands and items in posts
- Comment and engage with community content
- Public, private, or friends-only post options

### 💬 Messaging
- Real-time chat with friends
- Brand-specific conversations
- Message count indicators
- Seamless chat experience

### 🔔 Notifications
- Push notifications for brand sales
- Friend request alerts
- New message notifications
- Customizable notification preferences

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Hooks
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Camera/Images**: Expo ImagePicker
- **Backend**: Node.js/Express (separate repository)
- **Database**: MongoDB

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0+)
- **Expo Go**: Compatible for development

## 🎨 Design System

### Color Palette
- **Primary**: Burgundy (#800020)
- **Light Burgundy**: rgba(128, 0, 32, 0.1-0.8)
- **Background**: White (#FFFFFF)
- **Text**: Black (#000000)

### Typography
- System fonts optimized for each platform
- Consistent sizing and spacing
- Accessibility-compliant contrast ratios

## 🔧 Configuration

### Environment Setup

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Backend Connection

The mobile app connects to the Cherry Picked backend API. Ensure the backend server is running on `localhost:3001` or update the API_BASE_URL accordingly.

## 📦 Build and Deploy

### Development Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform all
```

### Production Build

```bash
# iOS App Store
eas build --profile production --platform ios

# Google Play Store
eas build --profile production --platform android
```

### App Store Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## 🔒 Security Features

- JWT token-based authentication
- Secure storage of user credentials
- Privacy controls for social features
- Data encryption in transit
- Secure image upload handling

## 🤝 Related Repositories

- **Backend API**: [cherry-picked](https://github.com/[your-username]/cherry-picked)
- **Web Application**: [cherry-picked-web](https://github.com/[your-username]/cherry-picked) (same repo as backend)

## 📈 Future Enhancements

- Offline support for browsing saved content
- Apple Pay/Google Pay integration
- Augmented reality try-on features
- Advanced styling recommendations
- Integration with fashion influencers
- Wishlist sharing capabilities

## 🐛 Known Issues

- Push notifications require physical device testing
- Camera permissions need manual handling on some Android versions
- Network requests may need CORS configuration for local development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Mobile**: React Native development
- **Backend**: Node.js/Express API
- **Design**: UI/UX optimization for mobile
- **DevOps**: App store deployment and CI/CD

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@example.com]
- Documentation: [Link to docs]

## 🏆 Acknowledgments

- Fashion brands for sale data integration
- Expo team for excellent React Native tooling
- React Navigation for seamless mobile navigation
- MongoDB team for robust database solutions

---

**Built with ❤️ for fashion enthusiasts who never miss a sale! 🛍️✨** 
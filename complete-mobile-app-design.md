# Cherry Picked Mobile App - Complete Design System
## iPhone 15 Optimized (393 x 852px)

---

## 🎨 **Design System**

### **Color Palette**
- **Primary Burgundy**: `#800020`
- **Light Burgundy**: `rgba(128, 0, 32, 0.1)`
- **White**: `#FFFFFF`
- **Black**: `#000000`
- **Gray Text**: `#666666`
- **Light Gray**: `#F8F8F8`
- **Success Green**: `#28a745`
- **Warning Orange**: `#ffc107`
- **Error Red**: `#dc3545`

### **Typography**
- **Primary Font**: SF Pro Display (iOS System Font)
- **Secondary Font**: SF Pro Text
- **Heading Sizes**: 32px, 28px, 24px, 20px, 18px
- **Body Text**: 16px, 14px
- **Caption**: 12px

### **Spacing System**
- **Base Unit**: 8px
- **Section Padding**: 24px
- **Component Spacing**: 16px
- **Small Spacing**: 8px

---

## 📱 **App Structure & Navigation**

### **Bottom Tab Navigation**
```
┌─────────────────────────────────┐
│ [Sales] [Friends] [Forum] [Chat] │
│ [Profile] [Admin*] [Notifications] │
└─────────────────────────────────┘
```

*Admin tab only visible for admin users

---

## 🛍️ **Screen 1: Sales Screen (Main Feed)**

### **Header**
- **Title**: "Sales Feed"
- **Country Selector**: Dropdown with flag icons
- **Notification Bell**: Badge for unread notifications
- **Search Icon**: Quick brand search

### **Category Tabs**
```
[All Sales] [AI Picks] [Flash Sales] [End of Season] [Student Deals] [Other Sales]
```

### **Sales Feed**
- **Brand Cards**: 160px height each
  - Brand logo (60px height)
  - Brand name (18px, bold)
  - Sale text (14px, burgundy)
  - Sale percentage (16px, bold, burgundy)
  - "Shop Now" button
  - Heart icon (favorite toggle)
  - AI score badge (if applicable)

### **Your Brands Section**
- **Section Title**: "Your Brands"
- **Brand Grid**: 2 columns, 120px height each
- **On-sale indicator**: Burgundy border/background

### **AI Recommendations Section**
- **Section Title**: "✨ Sales Picked For You"
- **AI Score**: 0-100 rating
- **Reason**: "Matches your style" / "One of your favorites"

---

## 👥 **Screen 2: Friends Screen**

### **Header**
- **Title**: "Friends"
- **Add Friend**: "+" button

### **Tabs**
```
[Friends] [Requests] [Discover]
```

### **Friends List**
- **Friend Card**: 80px height
  - Profile picture (48px circle)
  - Name (16px, bold)
  - Brand count (12px, gray)
  - "View Brands" button
  - "Chat" button

### **Friend Requests**
- **Request Card**: 100px height
  - Profile picture
  - Name and mutual friends
  - "Accept" / "Decline" buttons

### **Discover Friends**
- **Search by Email**: Input field
- **Suggested Friends**: Based on mutual connections

---

## 💬 **Screen 3: Forum Screen**

### **Header**
- **Title**: "Style Forum"
- **Create Post**: "+" button

### **Tabs**
```
[Trending] [Recent] [My Posts]
```

### **Post Card**
- **User Info**: Profile picture, name, timestamp
- **Post Content**: Text, images (max 4)
- **Tagged Items**: Brand names with links
- **Actions**: Like, Comment, Share
- **Privacy**: Public/Friends/Private indicator

### **Create Post Modal**
- **Text Input**: Large text area
- **Image Upload**: Camera/gallery buttons
- **Tag Brands**: Search and select brands
- **Privacy Settings**: Radio buttons
- **Post Button**: Burgundy background

---

## 💭 **Screen 4: Chat Screen**

### **Header**
- **Title**: "Chats"
- **New Chat**: "+" button

### **Chat List**
- **Chat Preview**: 80px height
  - Friend profile picture
  - Name (16px, bold)
  - Last message (14px, gray)
  - Timestamp (12px, gray)
  - Unread badge (red circle)

### **Chat Conversation**
- **Message Bubbles**: 
  - Sent: Burgundy background, right-aligned
  - Received: Light gray background, left-aligned
- **Input Bar**: Text input + send button
- **Typing Indicator**: "Friend is typing..."

---

## 🎨 **Screen 5: Style Profile Screen**

### **Header**
- **Title**: "Style Profile"
- **Edit**: Pencil icon

### **Style Analysis**
- **Detected Styles**: Tags (minimalist, boho, etc.)
- **Color Palette**: Color swatches
- **Confidence Level**: Progress bar

### **Style Images**
- **Image Grid**: 3 columns
- **Add Image**: "+" button
- **Image Actions**: Remove, analyze

### **Analysis Results**
- **Style Breakdown**: Percentage bars
- **Recommendations**: "Add more images for better analysis"

---

## 👤 **Screen 6: Profile Screen**

### **Header**
- **Profile Picture**: 80px circle
- **Edit Profile**: Pencil icon

### **User Info**
- **Name**: 24px, bold
- **Email**: 16px, gray
- **Member Since**: 14px, gray

### **Stats**
- **Friends Count**: Number + "Friends"
- **Favorite Brands**: Number + "Brands"
- **Posts Count**: Number + "Posts"

### **Settings**
- **Account Settings**: Password, email
- **Privacy Settings**: Who can see my brands
- **Notifications**: Push notification toggles
- **Discovery Preferences**: Monthly brand discovery settings

### **Actions**
- **Logout**: Red button
- **Delete Account**: Red text link

---

## 🔔 **Screen 7: Notifications Screen**

### **Header**
- **Title**: "Notifications"
- **Mark All Read**: Text button

### **Notification Types**
- **Sale Notifications**: "IRO Paris is on sale!"
- **Friend Requests**: "Jen Shin wants to be friends"
- **Brand Discoveries**: "3 new brands discovered for you"
- **Forum Activity**: "Someone liked your post"

### **Notification Card**
- **Icon**: Relevant emoji/icon
- **Title**: 16px, bold
- **Message**: 14px, gray
- **Timestamp**: 12px, gray
- **Action Button**: "View" / "Accept" / "Shop Now"

---

## ⚙️ **Screen 8: Admin Panel (Admin Only)**

### **Header**
- **Title**: "Admin Panel"
- **Logout**: Button

### **Tabs**
```
[Brand Requests] [User Management] [Analytics]
```

### **Brand Requests**
- **Request Card**: 120px height
  - Brand name (18px, bold)
  - User email (14px, gray)
  - Request date (12px, gray)
  - Status: New/In Progress/Added
  - Actions: "Approve" / "Reject" / "Mark In Progress"

### **User Management**
- **User List**: Searchable table
- **User Actions**: Make admin, suspend, delete
- **User Stats**: Registration date, activity

### **Analytics**
- **Sales Detected**: Number today/this week
- **Users Notified**: Number of notifications sent
- **Popular Brands**: Most favorited brands
- **Active Users**: Daily/weekly active users

---

## 🎯 **Screen 9: Brand Discovery Screen**

### **Header**
- **Title**: "Discover New Brands"
- **Refresh**: Circular arrow icon

### **Current Discoveries**
- **Discovery Card**: 140px height
  - Brand name (18px, bold)
  - Discovery reason (14px, gray)
  - Match score: 0-100 rating
  - Status: New/Liked/Added to Favorites
  - Actions: "Like" / "Add to Favorites"

### **Generate New Discoveries**
- **Requirements Check**: Style images needed
- **Generate Button**: "Get My Brand Discoveries"
- **Loading State**: "Analyzing Your Style..."

---

## 🔍 **Screen 10: Search Screen**

### **Header**
- **Search Bar**: Full width with search icon
- **Cancel**: Text button

### **Search Results**
- **Brand Results**: Brand cards with sale status
- **No Results**: "Brand not found" message
- **Loading State**: Spinner

---

## 🏪 **Screen 11: Brand Forum Screen**

### **Header**
- **Brand Logo**: 48px height
- **Brand Name**: 20px, bold
- **Back Button**: Arrow icon

### **Brand Info**
- **Description**: Brand description
- **Current Sales**: Active sale information

### **Posts**
- **Post Filter**: "All Posts" / "Sale Posts" / "Style Posts"
- **Post Cards**: Same as main forum but filtered by brand

---

## 📱 **Screen 12: Login/Register Screens**

### **Login Screen**
- **Logo**: Cherry Picked logo
- **Email Input**: Text field
- **Password Input**: Secure text field
- **Login Button**: Burgundy background
- **Register Link**: "Don't have an account?"

### **Register Screen**
- **First Name**: Text field
- **Last Name**: Text field
- **Email**: Text field
- **Password**: Secure text field
- **Confirm Password**: Secure text field
- **Register Button**: Burgundy background
- **Login Link**: "Already have an account?"

---

## 🎨 **Component Library**

### **Buttons**
- **Primary**: Burgundy background, white text, 56px height
- **Secondary**: White background, burgundy text, 44px height
- **Small**: 32px height, smaller text
- **Icon Button**: 44px square, icon only

### **Cards**
- **Brand Card**: 160px height, shadow, rounded corners
- **Feature Card**: 120px height, white background
- **Post Card**: Variable height, content-based
- **Notification Card**: 80px height, left-aligned

### **Input Fields**
- **Text Input**: 48px height, rounded corners, border
- **Search Input**: 44px height, search icon
- **Text Area**: Variable height, multiline

### **Navigation**
- **Bottom Tabs**: 5 tabs, burgundy active state
- **Top Navigation**: Back button, title, action button
- **Tab Navigation**: Horizontal scrollable tabs

---

## 🎬 **Animations & Interactions**

### **Page Transitions**
- **Slide Right**: Navigate forward
- **Slide Left**: Navigate back
- **Fade**: Modal presentations

### **Button Interactions**
- **Press**: Scale to 95%, 0.1s duration
- **Hover**: Background color change
- **Loading**: Spinner animation

### **List Interactions**
- **Pull to Refresh**: Sales feed, notifications
- **Swipe Actions**: Delete, archive, mark read
- **Long Press**: Context menu

### **Form Interactions**
- **Input Focus**: Border color change
- **Validation**: Error states, success states
- **Auto-save**: Draft saving

---

## 📐 **Responsive Considerations**

### **iPhone 15 Pro Max (430px)**
- Scale up elements by 1.1x
- Increase padding to 28px
- Larger touch targets

### **iPhone 14 (390px)**
- Scale down by 0.95x
- Reduce padding to 20px
- Compact layout

### **iPhone SE (375px)**
- Stack elements vertically
- Smaller text sizes
- Reduced spacing

---

## ♿ **Accessibility Features**

### **Visual**
- **Color Contrast**: Minimum 4.5:1 ratio
- **Text Size**: 16px minimum for body text
- **Touch Targets**: 44px minimum

### **Navigation**
- **VoiceOver Support**: Proper labels and hints
- **Keyboard Navigation**: Tab order and focus states
- **Gesture Alternatives**: Button alternatives for gestures

### **Content**
- **Alt Text**: All images have descriptive alt text
- **Semantic HTML**: Proper heading hierarchy
- **Screen Reader**: Announcements for dynamic content

---

## 🚀 **Implementation Notes**

### **State Management**
- **User Authentication**: JWT tokens, secure storage
- **Offline Support**: Cache sales data, sync when online
- **Real-time Updates**: WebSocket for notifications, chat

### **Performance**
- **Image Optimization**: WebP format, lazy loading
- **Code Splitting**: Load screens on demand
- **Caching**: API responses, user preferences

### **Security**
- **Input Validation**: Client and server-side validation
- **Data Encryption**: Sensitive data encryption
- **API Security**: Rate limiting, authentication

---

*This comprehensive design system covers all the features and screens for the Cherry Picked mobile app, ensuring a consistent and professional user experience for both admin and non-admin users.* 
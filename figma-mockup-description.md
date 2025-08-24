# Figma Implementation Guide - Cherry Picked Mobile Landing Page

## 🎨 **Visual Mockup Description**

### **Frame Setup**
- **Frame Size**: 393px × 852px
- **Device**: iPhone 15
- **Background**: #FFFFFF
- **Grid**: 8px base grid enabled

---

## 📱 **Section 1: Hero Section (0-60% of screen)**

### **Background**
- **Gradient**: Linear gradient from #FFFFFF (top) to rgba(128, 0, 32, 0.05) (bottom)
- **Direction**: 180° (top to bottom)

### **Logo Area (Top 80px)**
- **🍒 Cherry Logo**: 48px × 48px, centered horizontally
- **Position**: 59px from top (safe area), 172.5px from left
- **Color**: #800020

### **Main Heading (Below logo, 40px gap)**
- **Text**: "Discover Your Perfect Style, One Sale at a Time"
- **Font**: SF Pro Display, Bold, 32px
- **Color**: #800020
- **Alignment**: Center
- **Line Height**: 1.2
- **Width**: 320px (centered)

### **Subheading (Below main heading, 16px gap)**
- **Text**: "Never miss a deal from your favorite fashion brands"
- **Font**: SF Pro Text, Regular, 20px
- **Color**: #666666
- **Alignment**: Center
- **Line Height**: 1.4
- **Width**: 280px (centered)

### **Primary CTA Button (Below subheading, 32px gap)**
- **Text**: "Get Started Free"
- **Background**: #800020
- **Text Color**: #FFFFFF
- **Font**: SF Pro Display, Semibold, 18px
- **Size**: 280px × 56px
- **Border Radius**: 16px
- **Shadow**: 0px 4px 12px rgba(128, 0, 32, 0.3)

### **App Store Buttons (Below CTA, 24px gap)**
- **Container**: 280px × 44px, centered
- **App Store Badge**: 120px × 44px, left side
- **Google Play Badge**: 120px × 44px, right side
- **Gap between badges**: 40px

### **Phone Mockup (Below app store buttons, 40px gap)**
- **iPhone 15 Frame**: 280px × 560px, centered
- **Screen Content**: App screenshots showing:
  - Sales feed with brand cards
  - AI recommendations section
  - Friends/social features
- **Shadow**: 0px 8px 24px rgba(0, 0, 0, 0.15)

---

## ✨ **Section 2: Features Section (60-90% of screen)**

### **Section Title**
- **Text**: "Why Choose Cherry Picked?"
- **Font**: SF Pro Display, Bold, 24px
- **Color**: #800020
- **Alignment**: Center
- **Position**: 24px from section start

### **Feature Card 1: Smart Sale Detection**
- **Container**: 345px × 120px
- **Background**: #FFFFFF
- **Border Radius**: 16px
- **Shadow**: 0px 2px 8px rgba(0, 0, 0, 0.1)
- **Icon**: ✨ Sparkle, 32px × 32px, #800020
- **Title**: "Smart Sale Detection", SF Pro Display, Semibold, 18px, #000000
- **Description**: "Never miss a deal from your favorite brands", SF Pro Text, Regular, 14px, #666666
- **Position**: 24px from left, 16px below section title

### **Feature Card 2: AI Style Recommendations**
- **Container**: 345px × 120px
- **Background**: #FFFFFF
- **Border Radius**: 16px
- **Shadow**: 0px 2px 8px rgba(0, 0, 0, 0.1)
- **Icon**: 🎨 Paint Palette, 32px × 32px, #800020
- **Title**: "AI Style Recommendations", SF Pro Display, Semibold, 18px, #000000
- **Description**: "Personalized picks based on your unique style", SF Pro Text, Regular, 14px, #666666
- **Position**: 24px from left, 16px below Card 1

### **Feature Card 3: Social Shopping**
- **Container**: 345px × 120px
- **Background**: #FFFFFF
- **Border Radius**: 16px
- **Shadow**: 0px 2px 8px rgba(0, 0, 0, 0.1)
- **Icon**: 👥 People, 32px × 32px, #800020
- **Title**: "Social Shopping", SF Pro Display, Semibold, 18px, #000000
- **Description**: "Share and discover with fashion-forward friends", SF Pro Text, Regular, 14px, #666666
- **Position**: 24px from left, 16px below Card 2

---

## 🚀 **Section 3: Final CTA Section (90-100% of screen)**

### **Background**
- **Gradient**: Linear gradient from #800020 (top) to #600018 (bottom)
- **Direction**: 180° (top to bottom)

### **Heading**
- **Text**: "Ready to Transform Your Shopping Experience?"
- **Font**: SF Pro Display, Bold, 20px
- **Color**: #FFFFFF
- **Alignment**: Center
- **Position**: 24px from section start

### **Download Button**
- **Text**: "Download Now"
- **Background**: #FFFFFF
- **Text Color**: #800020
- **Font**: SF Pro Display, Semibold, 18px
- **Size**: 280px × 56px
- **Border Radius**: 16px
- **Position**: 24px from left, 16px below heading

### **Trust Indicators**
- **Text**: "Free • No Ads • Privacy First"
- **Font**: SF Pro Text, Regular, 12px
- **Color**: rgba(255, 255, 255, 0.8)
- **Alignment**: Center
- **Position**: 16px below download button

---

## 🎯 **Interactive Elements & States**

### **Button States**
- **Default**: As specified above
- **Pressed**: Scale to 95%, 0.1s duration
- **Hover**: Background 10% darker (#600018)

### **Card Interactions**
- **Default**: As specified above
- **Pressed**: Scale to 98%, 0.1s duration
- **Hover**: Shadow increases to 0px 4px 16px rgba(0, 0, 0, 0.15)

### **Scroll Behavior**
- **Hero Section**: Parallax effect on phone mockup
- **Features**: Staggered entrance animation (0.3s delay each)
- **Smooth Scrolling**: Native iOS behavior

---

## 📐 **Safe Areas & Constraints**

### **Top Safe Area**
- **Height**: 59px (Dynamic Island)
- **Content starts**: 59px from top

### **Bottom Safe Area**
- **Height**: 34px (Home Indicator)
- **Content ends**: 34px from bottom

### **Horizontal Safe Area**
- **Left**: 24px minimum
- **Right**: 24px minimum
- **Content width**: 345px maximum

---

## 🎨 **Color Variables (Figma)**

### **Primary Colors**
- `--primary-burgundy: #800020`
- `--light-burgundy: rgba(128, 0, 32, 0.1)`
- `--dark-burgundy: #600018`

### **Neutral Colors**
- `--white: #FFFFFF`
- `--black: #000000`
- `--gray-text: #666666`
- `--light-gray: #F8F8F8`

### **Gradients**
- `--hero-gradient: linear-gradient(180deg, #FFFFFF 0%, rgba(128, 0, 32, 0.05) 100%)`
- `--cta-gradient: linear-gradient(180deg, #800020 0%, #600018 100%)`

---

## 📱 **Responsive Considerations**

### **Auto Layout Setup**
- **Hero Section**: Vertical stack, center alignment
- **Features**: Vertical stack, 16px spacing
- **CTA Section**: Vertical stack, center alignment

### **Constraints**
- **Logo**: Center horizontally, fixed size
- **Buttons**: Center horizontally, fixed width
- **Cards**: Full width with 24px margins
- **Text**: Auto-width, center alignment

### **Breakpoints**
- **iPhone 15 Pro Max**: Scale 1.1x
- **iPhone 14**: Scale 0.95x
- **iPhone SE**: Compact layout

---

## 🎬 **Animation Specifications**

### **Page Load Animation**
- **Duration**: 0.6s
- **Easing**: ease-out
- **Elements**: Fade in from bottom, staggered

### **Scroll Animations**
- **Parallax**: Hero image moves at 0.5x scroll speed
- **Feature Cards**: Slide in from right, 0.3s delay each
- **CTA Section**: Fade in when scrolled into view

### **Interaction Animations**
- **Button Press**: Scale 95%, 0.1s duration
- **Card Hover**: Shadow increase, 0.2s duration
- **Icon Hover**: Color change, 0.2s duration

---

## 📋 **Implementation Checklist**

### **Design Elements**
- [ ] Create 393×852px frame
- [ ] Set up 8px grid system
- [ ] Apply color variables
- [ ] Create component library
- [ ] Set up auto layout

### **Content**
- [ ] Add logo and branding
- [ ] Create typography styles
- [ ] Design button components
- [ ] Create feature cards
- [ ] Add app store badges

### **Interactions**
- [ ] Set up button states
- [ ] Create hover effects
- [ ] Add scroll animations
- [ ] Test touch targets
- [ ] Verify accessibility

### **Export**
- [ ] Export hero image (2x)
- [ ] Export icons (SVG)
- [ ] Export color variables
- [ ] Create style guide
- [ ] Document components

---

*This guide provides all the specifications needed to create a professional, conversion-optimized mobile landing page for the Cherry Picked app in Figma.* 
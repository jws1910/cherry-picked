# Cherry Picked Mobile App - Landing Page Design Specification
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

### **Typography**
- **Primary Font**: SF Pro Display (iOS System Font)
- **Secondary Font**: SF Pro Text
- **Heading Sizes**: 32px, 28px, 24px, 20px
- **Body Text**: 16px, 14px
- **Caption**: 12px

### **Spacing System**
- **Base Unit**: 8px
- **Section Padding**: 24px
- **Component Spacing**: 16px
- **Small Spacing**: 8px

---

## 📱 **Layout Structure**

### **1. Hero Section (Top 60%)**
```
┌─────────────────────────────────┐
│                                 │
│  🍒 Cherry Picked              │
│                                 │
│  Discover Your Perfect          │
│  Style, One Sale at a Time      │
│                                 │
│  [Get Started Button]           │
│                                 │
│  [App Store] [Google Play]      │
│                                 │
│  📱 [iPhone Mockup]             │
│                                 │
└─────────────────────────────────┘
```

**Specifications:**
- **Background**: Gradient from white to light burgundy
- **Logo**: 48px height, centered
- **Main Heading**: 32px, bold, burgundy
- **Subheading**: 20px, regular, gray
- **CTA Button**: 56px height, burgundy background, white text
- **App Store Buttons**: 44px height each
- **Phone Mockup**: 280px height, centered

### **2. Features Section (30%)**
```
┌─────────────────────────────────┐
│  ✨ Smart Sale Detection        │
│  Never miss a deal from your    │
│  favorite brands                │
│                                 │
│  🎨 AI Style Recommendations    │
│  Personalized picks based on    │
│  your unique style              │
│                                 │
│  👥 Social Shopping             │
│  Share and discover with        │
│  fashion-forward friends        │
│                                 │
└─────────────────────────────────┘
```

**Specifications:**
- **Section Title**: 24px, bold, burgundy
- **Feature Cards**: 120px height, white background, 16px border radius
- **Icons**: 32px, burgundy
- **Feature Text**: 16px, regular, black
- **Card Spacing**: 16px between cards

### **3. CTA Section (10%)**
```
┌─────────────────────────────────┐
│  Ready to Transform Your        │
│  Shopping Experience?           │
│                                 │
│  [Download Now]                 │
│                                 │
│  Free • No Ads • Privacy First  │
│                                 │
└─────────────────────────────────┘
```

**Specifications:**
- **Background**: Burgundy gradient
- **Text**: White, 20px
- **Button**: White background, burgundy text, 56px height
- **Footer Text**: 12px, light gray

---

## 🎯 **Key Design Elements**

### **Navigation**
- **Status Bar**: iOS default (time, battery, signal)
- **Safe Area**: Respect iPhone 15 notch and home indicator
- **Scroll Behavior**: Smooth, native iOS scrolling

### **Interactive Elements**
- **Buttons**: 
  - Primary: 56px height, 16px border radius
  - Secondary: 44px height, 8px border radius
  - Hover states: 10% darker burgundy
- **Cards**: 16px border radius, subtle shadow
- **Icons**: 24px minimum touch target

### **Animations**
- **Page Load**: Fade in from bottom (0.6s ease-out)
- **Button Press**: Scale down to 95% (0.1s)
- **Scroll**: Parallax effect on hero image
- **Feature Cards**: Staggered entrance (0.3s delay each)

---

## 📐 **iPhone 15 Specific Considerations**

### **Screen Dimensions**
- **Width**: 393px
- **Height**: 852px
- **Safe Area Top**: 59px (notch)
- **Safe Area Bottom**: 34px (home indicator)
- **Usable Height**: 759px

### **Device Features**
- **Dynamic Island**: Account for 59px top safe area
- **Home Indicator**: 34px bottom safe area
- **Rounded Corners**: 47px corner radius
- **Haptic Feedback**: Enable for button interactions

### **Performance**
- **Image Optimization**: WebP format, 2x resolution for retina
- **Font Loading**: System fonts for fast rendering
- **Animation**: 60fps, hardware accelerated

---

## 🎨 **Visual Assets Needed**

### **Icons (32px)**
- 🍒 Cherry logo
- ✨ Sparkle (features)
- 🎨 Paint palette (AI)
- 👥 People (social)
- 📱 Phone mockup
- ⬇️ Download arrow

### **Images**
- **Hero Mockup**: iPhone 15 with app screenshots
- **Feature Screenshots**: 3 key app screens
- **Background Patterns**: Subtle geometric elements

### **Brand Assets**
- **Logo**: Cherry Picked wordmark
- **App Icons**: iOS and Android store icons
- **Screenshots**: High-quality app previews

---

## 📱 **Responsive Breakpoints**

### **iPhone 15 Pro Max (430px)**
- Scale up all elements by 1.1x
- Increase padding to 28px
- Larger hero image (320px height)

### **iPhone 14 (390px)**
- Scale down by 0.95x
- Reduce padding to 20px
- Smaller hero image (260px height)

### **iPhone SE (375px)**
- Compact layout
- Stack features vertically
- Smaller text sizes

---

## 🚀 **Implementation Notes**

### **Figma Setup**
1. **Frame**: 393 x 852px
2. **Grid**: 8px base grid
3. **Auto Layout**: Enable for responsive behavior
4. **Components**: Create reusable button and card components
5. **Prototyping**: Add scroll and tap interactions

### **Export Settings**
- **Hero Image**: 2x resolution (786px width)
- **Icons**: SVG format for scalability
- **Mockups**: PNG with transparent background
- **Colors**: Export as CSS variables

### **Accessibility**
- **Color Contrast**: Minimum 4.5:1 ratio
- **Touch Targets**: 44px minimum
- **Text Size**: 16px minimum for body text
- **Focus States**: Clear visual indicators

---

## 📋 **Design Checklist**

### **Hero Section**
- [ ] Logo centered and properly sized
- [ ] Clear value proposition
- [ ] Prominent CTA button
- [ ] App store badges
- [ ] Phone mockup with app screens

### **Features Section**
- [ ] 3 key features highlighted
- [ ] Clear icons and descriptions
- [ ] Consistent card design
- [ ] Proper spacing and alignment

### **CTA Section**
- [ ] Compelling final message
- [ ] Download button
- [ ] Trust indicators (free, no ads)
- [ ] Contact information

### **Overall Design**
- [ ] Consistent color scheme
- [ ] Proper typography hierarchy
- [ ] Smooth animations
- [ ] Mobile-optimized interactions
- [ ] Accessibility compliance

---

## 🎯 **Success Metrics**

### **Visual Appeal**
- Clean, modern design
- Consistent brand identity
- Professional appearance
- Engaging user experience

### **Conversion Optimization**
- Clear value proposition
- Prominent download buttons
- Trust indicators
- Minimal friction

### **Technical Quality**
- Fast loading times
- Smooth animations
- Cross-device compatibility
- Accessibility compliance

---

*This design specification provides a comprehensive foundation for creating a compelling mobile landing page for the Cherry Picked app, optimized specifically for iPhone 15 and following modern mobile design best practices.* 
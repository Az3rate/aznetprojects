# JavaScript Runtime Studio Style Guide

## 🎨 Design System Overview

The JavaScript Runtime Studio uses a **"Weighted & Anchored"** design system that emphasizes:
- **Substantial, weighty components** with strong visual presence
- **Anchored layouts** using CSS Grid for precise positioning
- **Dark theme** optimized for developer tools
- **Monospace typography** for technical interfaces
- **Layered depth** through shadows and borders

---

## 🎯 Core Design Principles

### 1. **Weighted Components**
All components have visual "weight" through:
- **Thick borders** (2-4px)
- **Multi-layer shadows** (outer + inset + glow)
- **Substantial padding** (16-20px)
- **Bold typography** (600-800 font-weight)

### 2. **Anchored Grid System**
- **CSS Grid** for main layout structure
- **Named grid areas** for semantic positioning
- **Responsive grid columns** with auto-fit patterns
- **Fixed aspect ratios** for consistent proportions

### 3. **Dark Technical Aesthetic**
- **Dark backgrounds** with subtle gradients
- **High contrast text** for readability
- **Colorful accents** for status indication
- **Glowing effects** for interactive elements

---

## 🌈 Color Palette

### **Background Colors**
```css
/* Primary backgrounds */
#010409  /* Page background (deepest) */
#0a0c10  /* Component backgrounds */
#0d1117  /* Header/toolbar backgrounds */
#161b22  /* Card backgrounds */
#21262d  /* Input backgrounds */

/* Glass effects */
rgba(33, 38, 45, 0.6)  /* Glass overlay */
rgba(33, 38, 45, 0.9)  /* Semi-opaque overlay */
```

### **Border Colors**
```css
#1c2128  /* Primary borders (thick) */
#21262d  /* Secondary borders */
#30363d  /* Input/select borders */
```

### **Text Colors**
```css
#e6edf3  /* Primary text (high contrast) */
#7d8590  /* Secondary text (muted) */
#ffffff  /* Emphasis text (buttons, highlights) */
```

### **Semantic Colors**
```css
/* Success/Positive */
#238636  /* Success border */
#00d448  /* Success bright */
#2ea043  /* Success gradient end */

/* Primary/Info */
#1f6feb  /* Primary border */
#58a6ff  /* Primary bright */
#388bfd  /* Primary gradient end */

/* Warning */
#d29922  /* Warning border */
#fbbf24  /* Warning bright */
#fb8500  /* Warning gradient end */

/* Error/Danger */
#f85149  /* Error border */
#da3633  /* Error dark */

/* Special: AI/Magic */
#8b5cf6  /* AI purple */
#c084fc  /* AI purple light */
```

---

## 📝 Typography System

### **Font Stack**
```css
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
```

### **Font Sizes**
```css
/* Headers */
20px  /* Main titles */
18px  /* Section titles */
16px  /* Subsection titles */
14px  /* Component titles */

/* Body text */
14px  /* Primary text */
13px  /* Button text */
12px  /* Secondary text */
10px  /* Helper text */

/* Large displays */
42px  /* Score values */
24px  /* Metric values */
```

### **Font Weights**
```css
font-weight: 900;  /* Score displays */
font-weight: 800;  /* Main titles */
font-weight: 700;  /* Section titles */
font-weight: 600;  /* Buttons, emphasis */
font-weight: 400;  /* Body text */
```

### **Text Styling Patterns**
```css
/* Section titles */
text-transform: uppercase;
letter-spacing: 1px;
margin: 0;

/* Button text */
text-transform: uppercase;
letter-spacing: 0.5px;
font-weight: 600;

/* Code text */
font-family: 'SF Mono', monospace;
white-space: pre-wrap;
word-wrap: break-word;
```

---

## 🧱 Component Patterns

### **1. WeightedContainer (Base Pattern)**
```css
.weighted-container {
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
}
```

### **2. WeightedButton System**
```css
.weighted-button {
  /* Base state */
  background: rgba(33, 38, 45, 0.9);
  color: #e6edf3;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Active state */
.weighted-button.active {
  background: linear-gradient(135deg, #238636, #2ea043);
  border-color: #238636;
  color: #ffffff;
}

/* Primary variant */
.weighted-button.primary {
  background: linear-gradient(135deg, #1f6feb, #0969da);
  border-color: #1f6feb;
}

/* Hover effects */
.weighted-button:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
```

### **3. ScoreCard Pattern**
```css
.score-card {
  background: linear-gradient(135deg, #161b22, #0d1117);
  border: 2px solid /* dynamic based on score */;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Score-based borders */
.score-card[data-score="excellent"] { border-color: #238636; }
.score-card[data-score="good"] { border-color: #1f6feb; }
.score-card[data-score="fair"] { border-color: #d29922; }
.score-card[data-score="poor"] { border-color: #f85149; }

/* Top accent bar */
.score-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: /* matching gradient */;
}
```

### **4. InsightCard Pattern**
```css
.insight-card {
  background: #161b22;
  border: 2px solid /* dynamic based on type */;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
}

/* Type-based styling */
.insight-card.success { border-color: #238636; }
.insight-card.warning { border-color: #d29922; }
.insight-card.error { border-color: #da3633; }
.insight-card.ai { 
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #161b22, #1a1129);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

/* Icon positioning */
.insight-card:before {
  content: /* emoji based on type */;
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 16px;
}
```

---

## 📐 Layout Patterns

### **1. Grid Layout System**
```css
/* Main container grid */
.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar content panel"
    "footer footer footer";
  gap: 24px;
  padding: 24px;
  height: 100vh;
  background: #010409;
}

/* Responsive grid for cards */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
```

### **2. Flexbox Patterns**
```css
/* Header layouts */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid #1c2128;
}

/* Control groups */
.control-group {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(33, 38, 45, 0.6);
  border: 1px solid #30363d;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}
```

---

## ✨ Interactive States

### **1. Hover Effects**
```css
/* Subtle lift on hover */
.hoverable:hover {
  transform: translateY(-1px);
  box-shadow: /* enhanced shadow */;
}

/* Glow effects */
.glow-on-hover:hover {
  box-shadow: 0 0 20px rgba(color, 0.3);
}

/* Filter effects */
.brighten-on-hover:hover {
  filter: brightness(1.2);
}
```

### **2. Active/Focus States**
```css
/* Focus rings for accessibility */
.focusable:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.3);
}

/* Active button press */
.pressable:active {
  transform: translateY(0);
}
```

### **3. Loading/Processing States**
```css
/* Pulse animation */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pulsing {
  animation: pulse 2s infinite;
}

/* Glow animation */
@keyframes glow {
  from { filter: brightness(1); }
  to { filter: brightness(1.5) drop-shadow(0 0 10px #8b5cf6); }
}

.glowing {
  animation: glow 3s ease-in-out infinite alternate;
}
```

---

## 🎛️ Form Controls

### **1. Input Fields**
```css
.weighted-input {
  background: #21262d;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 10px 14px;
  color: #e6edf3;
  font-size: 14px;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.8);
}

.weighted-input:focus {
  border-color: #1f6feb;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 0 0 3px rgba(31, 111, 235, 0.3);
}
```

### **2. Select Dropdowns**
```css
.weighted-select {
  background: #21262d;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 10px 14px;
  color: #e6edf3;
  font-size: 14px;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
}

.weighted-select option {
  background: #21262d;
  color: #e6edf3;
}

.weighted-select optgroup {
  background: #0d1117;
  color: #7d8590;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## 📦 Shadow System

### **1. Component Shadows**
```css
/* Base component shadow */
.shadow-base {
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

/* Header shadows */
.shadow-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Button shadows */
.shadow-button {
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Elevated shadow (hover) */
.shadow-elevated {
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
```

### **2. Glow Effects**
```css
/* Success glow */
.glow-success {
  box-shadow: 0 0 20px rgba(35, 134, 54, 0.3);
}

/* AI/Magic glow */
.glow-ai {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

/* Warning glow */
.glow-warning {
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
}
```

---

## 🔄 Animation Patterns

### **1. Entrance Animations**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0.8; }
  to { transform: scale(1); opacity: 1; }
}
```

### **2. Status Animations**
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 255, 0, 0); }
}

@keyframes completionGlow {
  0% { box-shadow: 0 0 3px rgba(73, 220, 73, 0.6); }
  50% { box-shadow: 0 0 12px rgba(73, 220, 73, 0.8); }
  100% { box-shadow: 0 0 3px rgba(73, 220, 73, 0.6); }
}
```

---

## 🎨 Specialized Components

### **1. Code Blocks**
```css
.code-block {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 20px;
  background: #0a0c10;
  color: #e6edf3;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Syntax highlighting */
.code-comment { color: #7d8590; }
.code-keyword { color: #ff7b72; }
.code-string { color: #a5d6ff; }
.code-function { color: #d2a8ff; }
```

### **2. Status Indicators**
```css
.status-indicator {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #0a0c10;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4);
  z-index: 15;
}

.status-indicator.completed {
  background: radial-gradient(circle, #00d448, #00a836);
  box-shadow: /* ... */, 0 0 16px rgba(0, 212, 72, 0.4);
}

.status-indicator.running {
  background: radial-gradient(circle, #fbbf24, #f59e0b);
  box-shadow: /* ... */, 0 0 16px rgba(251, 191, 36, 0.4);
}
```

---

## 🧪 Theme Implementation

### **1. CSS Custom Properties**
```css
:root {
  /* Colors */
  --color-bg-primary: #010409;
  --color-bg-secondary: #0a0c10;
  --color-bg-tertiary: #0d1117;
  --color-border-primary: #1c2128;
  --color-text-primary: #e6edf3;
  --color-text-secondary: #7d8590;
  --color-accent-success: #238636;
  --color-accent-primary: #1f6feb;
  --color-accent-warning: #d29922;
  --color-accent-error: #f85149;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Effects */
  --border-radius: 8px;
  --border-radius-sm: 6px;
  --border-radius-lg: 12px;
  --transition: all 0.2s ease;
}
```

### **2. Styled Components Theme**
```typescript
export const runtimePlaygroundTheme = {
  colors: {
    background: {
      primary: '#010409',
      secondary: '#0a0c10',
      tertiary: '#0d1117',
      card: '#161b22',
      input: '#21262d',
      glass: 'rgba(33, 38, 45, 0.6)'
    },
    border: {
      primary: '#1c2128',
      secondary: '#21262d',
      input: '#30363d'
    },
    text: {
      primary: '#e6edf3',
      secondary: '#7d8590',
      emphasis: '#ffffff'
    },
    accent: {
      success: '#238636',
      primary: '#1f6feb',
      warning: '#d29922',
      error: '#f85149',
      ai: '#8b5cf6'
    }
  },
  typography: {
    fontFamily: {
      mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
    },
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '24px',
      '3xl': '42px'
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      bold: 700,
      heavy: 800,
      black: 900
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  effects: {
    borderRadius: {
      sm: '6px',
      base: '8px',
      lg: '12px'
    },
    transition: {
      fast: 'all 0.1s ease',
      normal: 'all 0.2s ease',
      slow: 'all 0.3s ease'
    }
  }
};
```

---

## 🔧 Implementation Tips

### **1. Component Structure**
- Start with `WeightedContainer` as base
- Add semantic `grid-area` for positioning
- Layer shadows from outer to inner
- Use consistent padding (16-20px)

### **2. Responsive Patterns**
- Use `repeat(auto-fit, minmax(Npx, 1fr))` for grids
- Maintain aspect ratios with fixed heights
- Test at common breakpoints (768px, 1024px, 1440px)

### **3. Performance Considerations**
- Minimize `box-shadow` complexity
- Use `transform` for animations
- Prefer `opacity` over color transitions
- Consider `will-change` for frequently animated elements

### **4. Accessibility**
- Maintain 4.5:1 contrast ratio minimum
- Provide focus indicators
- Use semantic HTML structure
- Support keyboard navigation

---

## 📋 Quick Reference Checklist

**For any new component:**
- [ ] Uses `WeightedContainer` base styling
- [ ] Has 4px border with appropriate color
- [ ] Includes multi-layer box-shadow
- [ ] Uses SF Mono font family
- [ ] Has proper grid positioning
- [ ] Implements hover effects
- [ ] Maintains color theme consistency
- [ ] Includes focus states for accessibility
- [ ] Uses uppercase text for buttons/titles
- [ ] Has appropriate emoji icons

**Color usage:**
- [ ] Backgrounds follow depth hierarchy (#010409 → #0a0c10 → #0d1117 → #161b22)
- [ ] Borders use #1c2128 for primary, #30363d for inputs
- [ ] Text uses #e6edf3 for primary, #7d8590 for secondary
- [ ] Semantic colors match intended meaning (green=success, blue=primary, etc.)

This style guide serves as the foundation for maintaining visual consistency across the JavaScript Runtime Studio and can be adapted for styling other parts of your application. 
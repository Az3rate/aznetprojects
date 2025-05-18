# Audit Tracking

**Legend:**
- [ ] = TODO
- [X] = DONE

---

## src/
- [X] index.css  
  - Some hardcoded values for font-family, min-width, min-height, etc. These are global resets and do not interfere with the theme structure. Consider removing or moving to theme if full consistency is desired.
- [X] App.tsx  
  - No hardcoded style values. All theming is handled via ThemeProvider and GlobalStyles.
- [X] index.tsx  
  - No style logic. Entry point only.
- [X] setupTests.ts  
  - No style logic. Test setup only.

### components/
- [X] WelcomeModal.tsx

#### components/Terminal/
- [X] ProjectDetails.tsx  
  - All inline styles were converted to styled components and all values now use theme properties.
- [X] OptionsPanel.tsx  
  - All styles use theme values. No hardcoded or non-theme-driven properties found.
- [X] TerminalLayout.tsx  
  - All styles use theme values. All blur values now use theme.effects.blur.md. No remaining hardcoded blur values.
- [X] Terminal.styles.ts  
  - Most styles use theme values. All blur values now use theme.effects.blur.md. No remaining hardcoded blur values. glassEffect/glassEffectLight mixins use theme values.
- [X] Terminal.tsx  
  - Several inline style objects found, especially in FeaturedSidebar, project cards, and some <pre> and <span> elements. These should be refactored to use styled components and theme values.
- [X] FileExplorer.tsx  
  - All hardcoded values have been converted to use theme values. Font-family, padding, margin, colors, and font sizes now use theme properties. Created TreeContainer styled component for consistent tree rendering indentation.
- [X] SwirlBackground.tsx  
  - Hardcoded color (backgroundColor), blur, and brightness values in canvas rendering logic. Inline style objects for canvas elements. These could be moved to theme or constants for consistency.
- [X] WelcomeMessage.tsx  
  - All border-radius values now use theme.effects.borderRadius.sm. No remaining hardcoded border-radius values. All font-family, font-size, margin, padding, and box-shadow values are now theme-driven. Added theme.effects.boxShadow.projectHover for project card hover effects.
- [X] FileViewer.tsx  
  - All inline styles have been converted to styled components using theme values for colors, spacing, typography, and effects. Added hover effect for close button using theme.colors.background.hover.

#### components/Layout/
- [X] PageLayout.tsx  
  - All styles use theme values. No hardcoded or non-theme-driven properties found.
- [X] Grid.tsx  
  - All styles use theme values. All blur values now use theme.effects.blur.md. No remaining hardcoded blur values.

#### components/Pages/
- [X] ApiPage.tsx  
  - All hardcoded values have been converted to use theme values. Padding and margin now use theme.spacing.xl and theme.spacing.md respectively.

#### components/Navigation/
- [X] Footer.tsx  
  - All styles use theme values. No hardcoded or non-theme-driven properties found.
- [X] Navigation.tsx  
  - All styles use theme values. No hardcoded or non-theme-driven properties found.

### styles/
- [X] ThemeProvider.tsx  
  - No styles defined in this file. Only provides theme context.
- [X] styled.d.ts  
  - No styles defined in this file. Only type declarations.
- [X] theme.ts  
  - Theme values are defined here. All values are centralized and used throughout the codebase.
- [X] globalStyles.ts  
  - Most styles use theme values. All border-radius values now use theme.effects.borderRadius.sm. No remaining hardcoded border-radius values.

#### styles/mixins/
- [X] animations.ts  
  - All animation durations and transitions use theme values. No hardcoded style values found.
- [X] responsive.ts  
  - Breakpoint values are hardcoded as constants. No direct theme usage, but this is typical for breakpoints.
- [X] glass.ts  
  - All styles use theme values for background, blur, and border-radius.

### data/
- [X] projects.ts  
  - No UI or style logic. Data only.

### context/
- [X] UserPreferencesContext.tsx  
  - No UI or style logic. Context/provider only.
- [X] DirectoryContext.tsx  
  - No UI or style logic. Context/provider only.

### services/
- [X] commands.ts  
  - No UI or style logic. Service/logic only.
- [X] fileSystem.ts  
  - No UI or style logic. Service/logic only.

### types/
- [X] index.ts  
  - No UI or style logic. Type definitions only.

### hooks/
- [X] useTerminal.ts  
  - No UI or style logic. Hook/logic only.
- [X] useTypingSound.ts  
  - No UI or style logic. Hook/logic only.
- [X] useBackgroundAudio.ts  
  - No UI or style logic. Hook/logic only.

### utils/
- [X] debug.ts  
  - No UI or style logic. Utility only.
 
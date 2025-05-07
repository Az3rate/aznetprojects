# Customized Welcome Modal Implementation Plan

## Overview
Enhance the welcome modal to provide two different guided tours based on user type:
1. Recruiter Tour: Focus on projects and high-level overview
2. Technical Resource Tour: Focus on terminal capabilities and technical details

## Phase 1: UI Updates
- [ ] Add user type selection buttons to welcome modal
  - "I'm a Recruiter" button
  - "I'm a Technical Resource" button
- [ ] Style the buttons to match existing design
- [ ] Add smooth transition animations between selection and tour start

## Phase 2: Tour Content Structure
- [ ] Create separate tour content arrays for each user type
- [ ] Recruiter Tour Steps:
  1. Welcome message
  2. Featured projects overview
  3. Project showcase navigation
  4. Quick terminal overview
  5. Contact information
- [ ] Technical Resource Tour Steps:
  1. Welcome message
  2. Terminal capabilities overview
  3. File system navigation
  4. Command system explanation
  5. Project code exploration
  6. Customization options

## Phase 3: Implementation
- [ ] Update WelcomeMessage component to handle user type selection
- [ ] Implement tour state management
- [ ] Add tour step components
- [ ] Implement tour navigation controls
- [ ] Add progress indicators

## Phase 4: Testing & Refinement
- [ ] Test both tour flows
- [ ] Verify transitions and animations
- [ ] Check mobile responsiveness
- [ ] Gather feedback and make adjustments

## Phase 5: Polish
- [ ] Add keyboard navigation
- [ ] Implement tour persistence (remember user type)
- [ ] Add skip tour option
- [ ] Add ability to restart tour

## Success Criteria
- [ ] Both tours provide clear, relevant information
- [ ] UI is intuitive and engaging
- [ ] Transitions are smooth
- [ ] Content is properly formatted
- [ ] Mobile experience is good

## Next Steps
Let's start with Phase 1: UI Updates. Would you like to proceed with implementing the user type selection buttons? 
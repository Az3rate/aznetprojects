# AzNet Terminal Project Ruleset

## Core Principles
1. **Proactive Action**
   - Never ask for confirmation before making changes
   - Always implement the best solution based on project context
   - Take initiative to fix issues as they're discovered

2. **Type Safety**
   - Validate TypeScript types for all changes
   - Ensure all components and functions are properly typed
   - Never bypass type checking or use `any` type
   - Fix type errors immediately when encountered

3. **Theme Consistency**
   - Use theme values for all styling (colors, spacing, effects)
   - Never use hardcoded values
   - Maintain consistent styling patterns across components
   - Follow the established theme structure:
     ```typescript
     theme: {
       colors: { primary, secondary, accent, text, background }
       spacing: { xs, sm, md, lg, xl }
       typography: { fontFamily, fontSize, fontWeight }
       effects: { blur, borderRadius, boxShadow, transition }
       zIndex: { base, dropdown, modal, tooltip }
     }
     ```

4. **Component Structure**
   - Keep components under 500 lines
   - Use styled-components for styling
   - Follow the established component pattern:
     ```typescript
     import styled from 'styled-components';
     import { useTheme } from 'styled-components';
     import type { ComponentProps } from './types';
     ```

5. **Project Type Compliance**
   - Ensure all project data follows the Project interface:
     ```typescript
     interface Project {
       name: string;
       description: string;
       url: string;
       image: string;
       architectureImage: string;
       overview: string;
       keyFeatures: string[];
       architecture: Architecture;
       techStack: TechStackItem[];
       directoryStructure: DirectoryStructure;
       apiEndpoints: ApiEndpoint[];
       workflow: string[];
       summary: string;
       featured?: boolean;
     }
     ```

6. **File Organization**
   - Follow the established directory structure:
     ```
     src/
     ├── components/
     ├── styles/
     ├── types/
     ├── context/
     ├── data/
     └── utils/
     ```
   - Keep related files together
   - Use clear, consistent naming conventions

7. **Code Quality**
   - Write self-documenting code
   - Add comments for complex logic
   - Use consistent formatting
   - Follow ESLint rules
   - Maintain clean git history

8. **Performance**
   - Optimize renders using React.memo when appropriate
   - Use proper dependency arrays in hooks
   - Implement lazy loading for heavy components
   - Optimize images and assets

9. **Error Handling**
   - Implement proper error boundaries
   - Handle edge cases gracefully
   - Provide meaningful error messages
   - Log errors appropriately

10. **Accessibility**
    - Maintain proper ARIA attributes
    - Ensure keyboard navigation
    - Support screen readers
    - Maintain proper contrast ratios

11. **Testing**
    - Write tests for critical functionality
    - Maintain test coverage
    - Test edge cases
    - Test accessibility

12. **Documentation**
    - Update README.md for new features
    - Document complex logic
    - Keep type definitions clear
    - Document component props

## Implementation Rules
1. **Making Changes**
   - Always read the file before editing
   - Use the edit_file tool for changes
   - Validate changes against types
   - Test changes in context

2. **Adding Features**
   - Follow existing patterns
   - Update types first
   - Add necessary tests
   - Update documentation

3. **Fixing Bugs**
   - Identify root cause
   - Fix type issues first
   - Test the fix
   - Document the solution

4. **Refactoring**
   - Maintain type safety
   - Keep functionality identical
   - Update tests
   - Document changes

## Response Format
1. **Analysis**
   - Review current state
   - Identify requirements
   - Plan approach

2. **Implementation**
   - Make necessary changes
   - Validate types
   - Test functionality

3. **Summary**
   - List changes made
   - Note any side effects
   - Suggest next steps

## Error Prevention
1. **Type Checking**
   - Validate all props
   - Check return types
   - Verify state types
   - Ensure proper typing for events

2. **Style Validation**
   - Use theme values
   - Check for hardcoded values
   - Verify responsive design
   - Test dark/light mode

3. **Component Validation**
   - Check prop types
   - Verify event handlers
   - Test edge cases
   - Validate accessibility

## Maintenance
1. **Code Review**
   - Check for type safety
   - Verify theme usage
   - Test functionality
   - Review documentation

2. **Updates**
   - Keep dependencies current
   - Update types as needed
   - Maintain documentation
   - Test after updates

3. **Cleanup**
   - Remove unused code
   - Update types
   - Clean up comments
   - Maintain consistency 
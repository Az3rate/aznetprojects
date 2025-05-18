import { css } from 'styled-components';

export const glassEffect = css`
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.lg});
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
`;

export const glassEffectLight = css`
  background: ${({ theme }) => theme.colors.background.glassLight};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
`; 
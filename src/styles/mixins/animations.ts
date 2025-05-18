import { css, keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const slideIn = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
`;

export const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const fadeInAnimation = css`
  animation: ${fadeIn} ${({ theme }) => theme.effects.transition.normal};
`;

export const slideInAnimation = css`
  animation: ${slideIn} ${({ theme }) => theme.effects.transition.normal};
`;

export const pulseAnimation = css`
  animation: ${pulse} 2s infinite;
`;

export const transitionFast = css`
  transition: all ${({ theme }) => theme.effects.transition.fast};
`;

export const transitionNormal = css`
  transition: all ${({ theme }) => theme.effects.transition.normal};
`;

export const transitionSlow = css`
  transition: all ${({ theme }) => theme.effects.transition.slow};
`; 
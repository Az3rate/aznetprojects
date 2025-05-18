import { css } from 'styled-components';

const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
} as const;

export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`
} as const;

export const mobile = css`
  ${media.sm} {
    display: none;
  }
`;

export const desktop = css`
  display: none;
  ${media.sm} {
    display: block;
  }
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const flexRow = css`
  display: flex;
  flex-direction: row;
`;

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`; 
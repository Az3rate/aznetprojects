import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  height: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Copyright = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Links = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color ${({ theme }) => theme.effects.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <Copyright>
        © {currentYear} Hugo Villeneuve. All rights reserved.
      </Copyright>
      <Links>
        <Link href="mailto:contact@hugovilleneuve.com">Contact</Link>
        <Link href="https://github.com/Az3rate" target="_blank" rel="noopener noreferrer">GitHub</Link>
        <Link href="https://linkedin.com/in/hugovilleneuve" target="_blank" rel="noopener noreferrer">LinkedIn</Link>
      </Links>
      <SocialLinks>
        <Link href="https://twitter.com/hugovilleneuve" target="_blank" rel="noopener noreferrer">Twitter</Link>
        <Link href="https://github.com/Az3rate/terminal-interface" target="_blank" rel="noopener noreferrer">Source</Link>
      </SocialLinks>
    </FooterContainer>
  );
}; 
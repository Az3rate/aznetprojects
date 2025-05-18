import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styled, { useTheme } from 'styled-components';

const AsciiArt = styled.pre`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  white-space: pre;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  line-height: 1.2;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin: ${({ theme }) => theme.spacing.lg} 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const WelcomeText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.01em;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background.glass};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.glass};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1000px;
  width: 90%;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalHeader = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const ModalBody = styled.div`
  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    text-align: center;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const CloseButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.effects.transition.fast};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TourButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  transition: all ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserTypeButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const UserTypeButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.effects.transition.fast};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
    transform: translateY(-2px);
  }
`;

const UserTypeIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UserTypeTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UserTypeDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ModalBodyScrollable = styled(ModalBody)`
  max-height: 70vh;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const StyledSvg = styled.svg`
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.colors.button};
`;

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: (type: 'recruiter' | 'technical') => void;
}

export interface WelcomeModalRef {
  resetStep: () => void;
}

export const WelcomeModal = forwardRef<WelcomeModalRef, WelcomeModalProps>(
  ({ open, onClose, onStartTour }, ref) => {
    const [step, setStep] = useState(1);
    const theme = useTheme();

    useImperativeHandle(ref, () => ({
      resetStep: () => setStep(1),
    }));

    if (!open) return null;

    return (
      <ModalOverlay>
        <ModalContent>
          {step === 1 ? (
            <ModalBodyScrollable>
              <AsciiArt>
                {`
 .o.                  ooooo      ooo               .   
.888.                 888b.     88'             .o8   
.8"888.       oooooooo  8 88b.    8   .ooooo.  .o888oo 
.8' 888.     d'""7d8P   8   88b.  8  d88' 88b   888   
.88ooo8888.      .d8P'    8     88b.8  888ooo888   888   
.8'     888.   .d8P'  .P  8       888  888    .o   888 . 
o88o     o8888o d8888888P  o8o        8  Y8bod8P'   "888"       
                `}
              </AsciiArt>
              <Title>Welcome to the HV Portfolio Terminal</Title>
              <Subtitle>Created by <b>Hugo Villeneuve</b></Subtitle>
              <Section>
                <SectionTitle>My Journey</SectionTitle>
                <WelcomeText>
                  After years in corporate development, I chose to take time off and focus on building things that mattered to me. Using my savings, I dove into new technologies and created a series of real, working applications / tools people use and, in many cases, pay for. This period gave me space to grow, experiment, and build with care.
                </WelcomeText>
              </Section>
              <Section>
                <SectionTitle>The Challenge</SectionTitle>
                <WelcomeText>
                  Even with working applications and paying users, I found it difficult to explain the value of this work during interviews. Traditional hiring processes often overlook self-directed projects, no matter how real or successful they are. I wanted a better way to show my skills, my thinking, and what I'm capable of.
                </WelcomeText>
              </Section>
              <Section>
                <SectionTitle>Why This Portfolio Exists</SectionTitle>
                <WelcomeText>
                  This site is the answer. What you're looking at isn't just a portfolio... It's one of the projects itself. The terminal you're using is a fully working application, built from scratch. When you explore the files, you're exploring the code behind this very website. You can browse directories, read real code, and see how everything works together in one place. It's a direct, transparent way to show how I build & I hope it connects with people who care about that.
                </WelcomeText>
              </Section>
              <ButtonContainer>
                <TourButton onClick={() => setStep(2)}>Get Started</TourButton>
              </ButtonContainer>
            </ModalBodyScrollable>
          ) : (
            <ModalBodyScrollable>
              <Section>
                <SectionTitle>How would you like to explore?</SectionTitle>
                <UserTypeButtons>
                  <UserTypeButton onClick={() => onStartTour('recruiter')}>
                    <UserTypeIcon>
                      <StyledSvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-7.13a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </StyledSvg>
                    </UserTypeIcon>
                    <UserTypeTitle>I'm a Recruiter</UserTypeTitle>
                    <UserTypeDescription>
                      Get an overview of featured projects and key achievements
                    </UserTypeDescription>
                  </UserTypeButton>
                  <UserTypeButton onClick={() => onStartTour('technical')}>
                    <UserTypeIcon>
                      <StyledSvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.75l-7 7 7 7" />
                      </StyledSvg>
                    </UserTypeIcon>
                    <UserTypeTitle>I'm a Technical Resource</UserTypeTitle>
                    <UserTypeDescription>
                      Explore technical details and implementation specifics
                    </UserTypeDescription>
                  </UserTypeButton>
                  <UserTypeButton onClick={onClose}>
                    <UserTypeIcon>
                      <StyledSvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-9.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 0v.008m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25" />
                      </StyledSvg>
                    </UserTypeIcon>
                    <UserTypeTitle>I've been here before</UserTypeTitle>
                    <UserTypeDescription>
                      Skip the guided tour and jump straight into the portfolio.
                    </UserTypeDescription>
                  </UserTypeButton>
                </UserTypeButtons>
              </Section>
            </ModalBodyScrollable>
          )}
        </ModalContent>
      </ModalOverlay>
    );
  }
);

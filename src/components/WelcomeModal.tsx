import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styled, { useTheme } from 'styled-components';

const AsciiArt = styled.pre`
  color:rgba(234, 0, 255, 0.6);
  margin: 0 0 1.5rem;
  white-space: pre;
  font-family: 'Fira Code', monospace;
  line-height: 1.2;
  font-size: 0.85rem;
`;

const Title = styled.h1`
  color: #FFFFFF;
  font-size: 1.8rem;
  margin: 1.5rem 0;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  margin: 0.75rem 0 2rem;
  font-size: 1rem;
`;

const WelcomeText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem;
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.div`
  color: #FFFFFF;
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color:rgba(30, 30, 30, 0.47);
  border: 1px solid #333;
  padding: 2rem;
  max-width: 1000px;
  width: 90%;
  color: #fff;
`;

const ModalHeader = styled.h2`
  margin: 0 0 1.5rem;
  font-size: 1.8rem;
  color: #fff;
  text-align: center;
`;

const ModalBody = styled.div`
  p {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #ccc;
  }
`;

const CloseButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  transition: all 0.2s ease;
  font-family: 'Fira Code', monospace;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
  }
`;

const TourButton = styled.button`
  background:rgba(183, 0, 255, 0.64);
  color: #171A23;
  border: none;
  border-radius: 6px;
  padding: 12px 28px;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background:rgba(230, 0, 219, 0.89);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserTypeButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const UserTypeButton = styled.button`
  background-color: #2a2a2a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #fff;

  &:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
`;

const UserTypeIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const UserTypeTitle = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const UserTypeDescription = styled.span`
  font-size: 0.9rem;
  color: #ccc;
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
            <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <TourButton onClick={() => setStep(2)}>Get Started</TourButton>
              </div>
            </ModalBody>
          ) : (
            <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Section>
                <SectionTitle>How would you like to explore?</SectionTitle>
                <UserTypeButtons>
                  <UserTypeButton onClick={() => onStartTour('recruiter')}>
                    <UserTypeIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, color: theme.colors.button }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-7.13a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </UserTypeIcon>
                    <UserTypeTitle>I'm a Recruiter</UserTypeTitle>
                    <UserTypeDescription>
                      Get an overview of featured projects and key achievements
                    </UserTypeDescription>
                  </UserTypeButton>
                  <UserTypeButton onClick={() => onStartTour('technical')}>
                    <UserTypeIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, color: theme.colors.button }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.75l-7 7 7 7" />
                      </svg>
                    </UserTypeIcon>
                    <UserTypeTitle>I'm a Technical Resource</UserTypeTitle>
                    <UserTypeDescription>
                      Explore technical details and implementation specifics
                    </UserTypeDescription>
                  </UserTypeButton>
                  <UserTypeButton onClick={onClose}>
                    <UserTypeIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, color: theme.colors.button }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-9.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 0v.008m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25" />
                      </svg>
                    </UserTypeIcon>
                    <UserTypeTitle>I've been here before</UserTypeTitle>
                    <UserTypeDescription>
                      Skip the guided tour and jump straight into the portfolio.
                    </UserTypeDescription>
                  </UserTypeButton>
                </UserTypeButtons>
              </Section>
            </ModalBody>
          )}
        </ModalContent>
      </ModalOverlay>
    );
  }
);

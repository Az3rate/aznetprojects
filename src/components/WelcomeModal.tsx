import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';

const AsciiArt = styled.pre`
  color: #00FFB2;
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
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
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
  background: #00FFB2;
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
    background: #00E6A1;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserTypeButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
                  After years in corporate development, I made a deliberate choice to step back and invest in my growth as a developer. Using my savings, I dedicated myself to mastering new technologies and building practical solutions that solve real problems. This journey led me to create several successful web applications and bots that generate subscription revenue while allowing me to explore cutting-edge technologies.
                </WelcomeText>
              </Section>
              <Section>
                <SectionTitle>The Challenge</SectionTitle>
                <WelcomeText>
                  Despite building and maintaining profitable applications, I noticed a disconnect between my entrepreneurial achievements and how they were perceived in traditional recruitment processes. While I had created real, working products that users paid for, these accomplishments often didn't translate effectively in interviews. This realization sparked the creation of this portfolio.
                </WelcomeText>
              </Section>
              <Section>
                <SectionTitle>Why This Portfolio?</SectionTitle>
                <WelcomeText>
                  This isn't just another static portfolio. It's a living demonstration of my technical capabilities, built as a modern terminal interface that lets you explore my actual codebase, architecture decisions, and project implementations. Every file you see is real, every command works, and every project shown is a testament to my commitment to quality and innovation.
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
                    <UserTypeIcon>👥</UserTypeIcon>
                    <UserTypeTitle>I'm a Recruiter</UserTypeTitle>
                    <UserTypeDescription>
                      Get an overview of featured projects and key achievements
                    </UserTypeDescription>
                  </UserTypeButton>
                  <UserTypeButton onClick={() => onStartTour('technical')}>
                    <UserTypeIcon>👨‍💻</UserTypeIcon>
                    <UserTypeTitle>I'm a Technical Resource</UserTypeTitle>
                    <UserTypeDescription>
                      Explore technical details and implementation specifics
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

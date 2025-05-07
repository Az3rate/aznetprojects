import React from 'react';
import styled from 'styled-components';

const OptionsContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
`;

const OptionGroup = styled.div`
  margin-bottom: 1rem;
`;

const OptionLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VolumeSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const VolumeIcon = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const AboutButton = styled.button`
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.button};
  border-radius: 2px;
  padding: 8px 18px;
  font-weight: 700;
  font-family: 'Fira Code', monospace;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 0 8px ${({ theme }) => theme.colors.button}55;
  margin-top: 6px;
  margin-bottom: 2px;
  width: 100%;
`;

interface OptionsPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleBackground: () => void;
  isBackgroundMuted: boolean;
  onOpenWelcome: () => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ 
  volume, 
  onVolumeChange,
  onToggleBackground,
  isBackgroundMuted,
  onOpenWelcome
}) => {
  const getVolumeIcon = (vol: number) => {
    if (vol === 0) return '🔇';
    if (vol < 0.3) return '🔈';
    if (vol < 0.7) return '🔉';
    return '🔊';
  };

  const getBackgroundIcon = () => {
    return isBackgroundMuted ? '' : '';
  };

  return (
    <OptionsContainer>
      <OptionGroup>
        <OptionLabel>
          Sound Settings
          <VolumeIcon onClick={onToggleBackground} title="Toggle background music">
            {getBackgroundIcon()}
          </VolumeIcon>
        </OptionLabel>
        <VolumeControl>
          <VolumeIcon>{getVolumeIcon(volume)}</VolumeIcon>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          />
        </VolumeControl>
      </OptionGroup>
      <OptionGroup>
        <OptionLabel>Controls</OptionLabel>
        <AboutButton onClick={onOpenWelcome}>
          About This Portfolio
        </AboutButton>
      </OptionGroup>
    </OptionsContainer>
  );
}; 
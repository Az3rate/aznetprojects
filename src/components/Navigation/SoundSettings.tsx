import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const SoundWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  transition: background ${({ theme }) => theme.effects.transition.fast};
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.background.hover};
    outline: none;
  }
`;

const Popover = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.effects.boxShadow.md};
  padding: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const VolumeSlider = styled.input`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const VolumeLabel = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface SoundSettingsProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ volume, onVolumeChange, isMuted, onToggleMute }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  return (
    <SoundWrapper ref={wrapperRef}>
      <IconButton aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={() => setOpen((v) => !v)}>
        {getVolumeIcon()}
      </IconButton>
      {open && (
        <Popover role="dialog" aria-label="Sound Settings">
          <VolumeLabel>
            Volume
            <IconButton aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={onToggleMute}>
              {getVolumeIcon()}
            </IconButton>
          </VolumeLabel>
          <VolumeSlider
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume slider"
          />
        </Popover>
      )}
    </SoundWrapper>
  );
}; 
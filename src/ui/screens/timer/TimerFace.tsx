/**
 * Timer face resolver — picks the active timer design.
 *
 * The selected design id comes from user preferences (settingsStore).
 * New designs are registered in timerDesigns.ts and rendered here.
 */
import React from 'react';
import { TimerFaceMinimal } from './TimerFaceMinimal';
import { TimerFaceCircle } from './TimerFaceCircle';
import type { TimerMode } from '../../../types';

interface TimerFaceProps {
  designId: string;
  remainingSeconds: number;
  duration: number;
  mode: TimerMode;
  isRunning: boolean;
}

export function TimerFace({ designId, ...rest }: TimerFaceProps) {
  switch (designId) {
    case 'circle':
      return <TimerFaceCircle {...rest} />;
    case 'minimal':
    default:
      return <TimerFaceMinimal {...rest} />;
  }
}

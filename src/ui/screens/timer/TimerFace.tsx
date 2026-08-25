/**
 * Timer face resolver — picks the active timer design.
 *
 * The selected design id comes from user preferences (settingsStore).
 * New designs are registered in timerDesigns.ts and rendered here.
 */
import React from 'react';
import { TimerFaceMinimal } from './TimerFaceMinimal';
import { TimerFaceCircle } from './TimerFaceCircle';
import { TimerFaceDigital } from './TimerFaceDigital';
import { TimerFaceArc } from './TimerFaceArc';
import { TimerFaceNeon } from './TimerFaceNeon';
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
    case 'digital':
      return <TimerFaceDigital {...rest} />;
    case 'arc':
      return <TimerFaceArc {...rest} />;
    case 'neon':
      return <TimerFaceNeon {...rest} />;
    case 'minimal':
    default:
      return <TimerFaceMinimal {...rest} />;
  }
}

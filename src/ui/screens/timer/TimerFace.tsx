/**
 * Timer face resolver — picks the active timer design.
 *
 * The selected design id comes from user preferences (settingsStore).
 * New designs are registered in timerDesigns.ts and rendered here.
 */
import React from 'react';
import { Pressable } from 'react-native';
import { TimerFaceMinimal } from './TimerFaceMinimal';
import { TimerFaceCircle } from './TimerFaceCircle';
import { TimerFaceDigital } from './TimerFaceDigital';
import { TimerFaceArc } from './TimerFaceArc';
import { TimerFaceNeon } from './TimerFaceNeon';
import { TimerFaceForest } from './TimerFaceForest';
import type { TimerMode } from '../../../types';

interface TimerFaceProps {
  designId: string;
  remainingSeconds: number;
  duration: number;
  mode: TimerMode;
  isRunning: boolean;
  onPress?: () => void;
}

export function TimerFace({ designId, onPress, ...rest }: TimerFaceProps) {
  const face = (() => {
    switch (designId) {
      case 'forest':
        return <TimerFaceForest {...rest} />;
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
  })();

  if (onPress) {
    return <Pressable onPress={onPress}>{face}</Pressable>;
  }

  return face;
}

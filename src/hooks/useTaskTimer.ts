/**
 * useTaskTimer Hook
 *
 * A custom hook that encapsulates task timer logic.
 * Includes persistence via LocalStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerState, UseTaskTimerReturn } from '@/types';
import {
  formatElapsedTime,
  formatTimestamp,
  calculateElapsedTime,
  startTimer,
  pauseTimer as pauseTimerUtil,
  resumeTimer as resumeTimerUtil,
  saveTimerState,
  loadTimerState,
  clearTimerState,
} from '@/utils/timer';

/**
 * Custom hook for managing a task timer
 * @param taskId The ID of the target task (timer is disabled when null)
 * @returns Timer state and actions
 */
export function useTaskTimer(taskId: string | null): UseTaskTimerReturn {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Initialization: restore state from LocalStorage
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (taskId) {
      const savedState = loadTimerState();
      if (savedState && savedState.taskId === taskId) {
        // Recalculate elapsed time from the restored state
        const elapsed = calculateElapsedTime(savedState);
        setTimerState(savedState);
        setElapsedTime(elapsed);
      } else {
        // Start a new timer for a new task
        const newState = startTimer(taskId);
        setTimerState(newState);
        setElapsedTime(0);
        saveTimerState(newState);
      }
    }
  }, []);

  // Handle task ID changes
  useEffect(() => {
    // Skip before initialization
    if (!isInitializedRef.current) return;

    if (taskId) {
      // If the task ID differs from the current timer
      if (!timerState || timerState.taskId !== taskId) {
        // Attempt to restore from LocalStorage BEFORE clearing
        const savedState = loadTimerState();
        if (savedState && savedState.taskId === taskId) {
          const elapsed = calculateElapsedTime(savedState);
          setTimerState(savedState);
          setElapsedTime(elapsed);
        } else {
          // Clear the old state and start a new timer
          clearTimerState();
          const newState = startTimer(taskId);
          setTimerState(newState);
          setElapsedTime(0);
          saveTimerState(newState);
        }
      }
    } else {
      // Reset the timer when there is no task
      setTimerState(null);
      setElapsedTime(0);
      clearTimerState();
    }
  }, [taskId]);

  // Persist to LocalStorage on state changes
  useEffect(() => {
    if (timerState) {
      saveTimerState(timerState);
    }
  }, [timerState]);

  // Update logic at 1-second intervals
  useEffect(() => {
    // Stop the interval if the timer is inactive or paused
    if (!timerState || timerState.isPaused) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update elapsed time at 1-second intervals
    const updateElapsedTime = () => {
      const elapsed = calculateElapsedTime(timerState);
      setElapsedTime(elapsed);
    };

    // Initial update
    updateElapsedTime();

    // Set up the interval
    intervalRef.current = window.setInterval(updateElapsedTime, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  // Pause action
  const pause = useCallback(() => {
    if (timerState && !timerState.isPaused) {
      const newState = pauseTimerUtil(timerState);
      setTimerState(newState);
      // Freeze the elapsed time at the moment of pausing
      setElapsedTime(calculateElapsedTime(newState));
    }
  }, [timerState]);

  // Resume action
  const resume = useCallback(() => {
    if (timerState && timerState.isPaused) {
      const newState = resumeTimerUtil(timerState);
      setTimerState(newState);
    }
  }, [timerState]);

  // Compute return values
  const isRunning = timerState !== null && !timerState.isPaused;
  const isPaused = timerState?.isPaused ?? false;
  const formattedTime = formatElapsedTime(elapsedTime);
  const startTimestamp = timerState ? formatTimestamp(timerState.startTime) : '';
  const resumeTimestamp = timerState?.lastResumeTime
    ? formatTimestamp(timerState.lastResumeTime)
    : null;

  return {
    elapsedTime,
    formattedTime,
    startTimestamp,
    resumeTimestamp,
    isPaused,
    isRunning,
    pause,
    resume,
  };
}

/**
 * useTaskTimer Hook
 *
 * タスクタイマーのロジックをカプセル化するカスタムフック。
 * LocalStorageによる永続化機能を含む。
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
 * タスクタイマーを管理するカスタムフック
 * @param taskId 対象タスクのID（nullの場合はタイマー無効）
 * @returns タイマー状態とアクション
 */
export function useTaskTimer(taskId: string | null): UseTaskTimerReturn {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // 初期化：LocalStorageからの状態復元
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (taskId) {
      const savedState = loadTimerState();
      if (savedState && savedState.taskId === taskId) {
        // 復元した状態で経過時間を再計算
        const elapsed = calculateElapsedTime(savedState);
        setTimerState(savedState);
        setElapsedTime(elapsed);
      } else {
        // 新しいタスクの場合、タイマーを開始
        const newState = startTimer(taskId);
        setTimerState(newState);
        setElapsedTime(0);
        saveTimerState(newState);
      }
    }
  }, []);

  // タスクID変更時の処理
  useEffect(() => {
    // 初期化前はスキップ
    if (!isInitializedRef.current) return;

    if (taskId) {
      // 現在のタイマーと異なるタスクIDの場合
      if (!timerState || timerState.taskId !== taskId) {
        // 古い状態をクリア
        clearTimerState();

        // LocalStorageから復元を試みる
        const savedState = loadTimerState();
        if (savedState && savedState.taskId === taskId) {
          const elapsed = calculateElapsedTime(savedState);
          setTimerState(savedState);
          setElapsedTime(elapsed);
        } else {
          // 新しいタイマーを開始
          const newState = startTimer(taskId);
          setTimerState(newState);
          setElapsedTime(0);
          saveTimerState(newState);
        }
      }
    } else {
      // タスクがない場合、タイマーをリセット
      setTimerState(null);
      setElapsedTime(0);
      clearTimerState();
    }
  }, [taskId]);

  // 状態変更時のLocalStorage保存
  useEffect(() => {
    if (timerState) {
      saveTimerState(timerState);
    }
  }, [timerState]);

  // 1秒間隔の更新ロジック
  useEffect(() => {
    // タイマーが無効または一時停止中の場合はインターバルを停止
    if (!timerState || timerState.isPaused) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 1秒間隔で経過時間を更新
    const updateElapsedTime = () => {
      const elapsed = calculateElapsedTime(timerState);
      setElapsedTime(elapsed);
    };

    // 初回更新
    updateElapsedTime();

    // インターバル設定
    intervalRef.current = window.setInterval(updateElapsedTime, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  // 一時停止アクション
  const pause = useCallback(() => {
    if (timerState && !timerState.isPaused) {
      const newState = pauseTimerUtil(timerState);
      setTimerState(newState);
      // 一時停止時の経過時間を固定
      setElapsedTime(calculateElapsedTime(newState));
    }
  }, [timerState]);

  // 再開アクション
  const resume = useCallback(() => {
    if (timerState && timerState.isPaused) {
      const newState = resumeTimerUtil(timerState);
      setTimerState(newState);
    }
  }, [timerState]);

  // 戻り値の計算
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

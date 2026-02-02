# Data Model: タスクタイマー機能

**Feature**: 002-add-task-timer
**Date**: 2026-02-02
**Status**: Complete

## エンティティ概要

本機能で新規に定義するデータモデルと、既存モデルとの関係を記述する。

```
┌─────────────────┐     参照      ┌─────────────────┐
│   TimerState    │ ──────────── │      Task       │
│                 │    taskId    │   (既存)         │
└─────────────────┘              └─────────────────┘
        │
        │ 永続化
        ▼
┌─────────────────┐
│TimerStorageSchema│
│  (LocalStorage) │
└─────────────────┘
```

---

## 1. TimerState（新規）

タイマーの現在の状態を表すエンティティ。

### フィールド定義

| フィールド | 型 | 必須 | 説明 | 制約 |
|-----------|------|------|------|------|
| `taskId` | `string` | ✓ | 対象タスクのID | 既存のTask.idと一致する必要がある |
| `startTime` | `number` | ✓ | タイマー開始時刻（Unix timestamp ms） | `> 0` |
| `lastResumeTime` | `number \| null` | - | 最新の再開時刻（Unix timestamp ms） | 再開していない場合は`null` |
| `isPaused` | `boolean` | ✓ | 一時停止中フラグ | - |
| `pauseStartTime` | `number \| null` | - | 一時停止開始時刻（Unix timestamp ms） | `isPaused === true`の場合は必須 |
| `totalPausedTime` | `number` | ✓ | 累積一時停止時間（ms） | `>= 0` |

### TypeScript型定義

```typescript
/**
 * タイマーの状態を表すインターフェース
 */
export interface TimerState {
  /**
   * 対象タスクのID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  taskId: string;

  /**
   * タイマー開始時刻（Unix timestamp ms）
   * タスクがCall Stackに入った時刻
   * @example 1706875200000
   */
  startTime: number;

  /**
   * 最新の再開時刻（Unix timestamp ms）
   * 一度も一時停止していない場合はnull
   * @example 1706875500000
   */
  lastResumeTime: number | null;

  /**
   * 一時停止中フラグ
   */
  isPaused: boolean;

  /**
   * 一時停止開始時刻（Unix timestamp ms）
   * isPaused === falseの場合はnull
   * @example 1706875300000
   */
  pauseStartTime: number | null;

  /**
   * 累積一時停止時間（ms）
   * 複数回一時停止した場合の合計
   * @example 120000 (2分)
   */
  totalPausedTime: number;
}
```

### バリデーションルール

```typescript
/**
 * TimerStateのバリデーション
 */
export function validateTimerState(state: TimerState): ValidationResult {
  const errors: string[] = [];

  // taskIdは空でない文字列
  if (!state.taskId || state.taskId.trim() === '') {
    errors.push('taskId is required');
  }

  // startTimeは正の数値
  if (state.startTime <= 0) {
    errors.push('startTime must be a positive number');
  }

  // totalPausedTimeは非負
  if (state.totalPausedTime < 0) {
    errors.push('totalPausedTime must be non-negative');
  }

  // isPausedがtrueの場合、pauseStartTimeは必須
  if (state.isPaused && state.pauseStartTime === null) {
    errors.push('pauseStartTime is required when isPaused is true');
  }

  // isPausedがfalseの場合、pauseStartTimeはnull
  if (!state.isPaused && state.pauseStartTime !== null) {
    errors.push('pauseStartTime must be null when isPaused is false');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 2. TimerStorageSchema（新規）

LocalStorageに保存されるタイマー状態のスキーマ。

### フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `version` | `string` | ✓ | スキーマバージョン（セマンティックバージョニング） |
| `timerState` | `TimerState \| null` | ✓ | タイマー状態（タイマーが無効な場合はnull） |
| `lastModified` | `string` | ✓ | 最終更新日時（ISO 8601形式） |

### TypeScript型定義

```typescript
/**
 * タイマー状態のLocalStorageスキーマ
 */
export interface TimerStorageSchema {
  /**
   * スキーマバージョン
   * @example "1.0.0"
   */
  version: string;

  /**
   * タイマー状態
   * タイマーが無効（タスクがCall Stackにない）場合はnull
   */
  timerState: TimerState | null;

  /**
   * 最終更新日時（ISO 8601形式）
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  lastModified: string;
}

/**
 * タイマー用のストレージキー
 */
export const TIMER_STORAGE_KEY = 'eventloop4human:timer' as const;

/**
 * タイマースキーマの現在のバージョン
 */
export const TIMER_STORAGE_VERSION = '1.0.0' as const;
```

---

## 3. 計算プロパティ

タイマー状態から導出される値の計算ロジック。

### 経過時間（elapsedTime）

```typescript
/**
 * 経過時間を計算（一時停止時間を除く）
 * @param state タイマー状態
 * @param currentTime 現在時刻（テスト用に注入可能）
 * @returns 経過時間（ms）
 */
export function calculateElapsedTime(
  state: TimerState,
  currentTime: number = Date.now()
): number {
  if (state.isPaused) {
    // 一時停止中は、一時停止開始時点までの時間を返す
    return state.pauseStartTime! - state.startTime - state.totalPausedTime;
  }

  // 動作中は、現在時刻から開始時刻と累積一時停止時間を引く
  return currentTime - state.startTime - state.totalPausedTime;
}
```

### 表示用フォーマット

```typescript
/**
 * 経過時間を表示用フォーマットに変換
 * @param ms 経過時間（ms）
 * @returns フォーマット済み文字列（MM:SS または HH:MM:SS）
 */
export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * タイムスタンプを表示用フォーマットに変換
 * @param timestamp Unix timestamp (ms)
 * @returns フォーマット済み文字列（MMM D HH:MM:SS）
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}
```

---

## 4. 状態遷移

タイマー状態の遷移を定義する。

```
[初期状態: null]
       │
       │ タスクがCall Stackに入る
       ▼
┌──────────────────────────────────┐
│ RUNNING (動作中)                  │
│ - isPaused: false                │
│ - pauseStartTime: null           │
│ - startTime: 設定済み             │
└──────────────────────────────────┘
       │                    ▲
       │ pause()            │ resume()
       ▼                    │
┌──────────────────────────────────┐
│ PAUSED (一時停止中)               │
│ - isPaused: true                 │
│ - pauseStartTime: 設定済み        │
│ - lastResumeTime: 更新            │
└──────────────────────────────────┘
       │
       │ タスクがCall Stackを離れる
       ▼
[終了状態: null (クリア)]
```

### 状態遷移アクション

```typescript
/**
 * タイマーを開始
 */
export function startTimer(taskId: string): TimerState {
  return {
    taskId,
    startTime: Date.now(),
    lastResumeTime: null,
    isPaused: false,
    pauseStartTime: null,
    totalPausedTime: 0,
  };
}

/**
 * タイマーを一時停止
 */
export function pauseTimer(state: TimerState): TimerState {
  if (state.isPaused) return state; // 既に一時停止中

  return {
    ...state,
    isPaused: true,
    pauseStartTime: Date.now(),
  };
}

/**
 * タイマーを再開
 */
export function resumeTimer(state: TimerState): TimerState {
  if (!state.isPaused) return state; // 既に動作中

  const now = Date.now();
  const pauseDuration = now - state.pauseStartTime!;

  return {
    ...state,
    isPaused: false,
    pauseStartTime: null,
    lastResumeTime: now,
    totalPausedTime: state.totalPausedTime + pauseDuration,
  };
}

/**
 * タイマーをクリア（タスクがCall Stackを離れた時）
 */
export function clearTimer(): null {
  return null;
}
```

---

## 5. 既存モデルとの関係

### Task（既存・変更なし）

```typescript
// 既存の Task インターフェース（参考）
interface Task {
  id: string;           // TimerState.taskIdが参照
  name: string;
  estimatedTime: number | null;
  category: string | null;
  memo: string | null;
  createdAt: string;
  area: AreaType;
  order: number;
}
```

### EventLoopState（既存・変更なし）

```typescript
// 既存の EventLoopState インターフェース（参考）
interface EventLoopState {
  callStack: Task | null;  // タイマーはこのタスクを対象とする
  microtaskQueue: Task[];
  taskQueue: Task[];
  webAPI: Task[];
}
```

タイマー状態は `EventLoopState` とは**独立**して管理される。
- `callStack` にタスクが入った時、タイマーを開始
- `callStack` が `null` または異なるタスクIDになった時、タイマーをクリア

---

## 6. LocalStorageスキーマ互換性

### 既存スキーマ（変更なし）

```typescript
// 既存のストレージキーとスキーマは変更しない
const STORAGE_KEY = 'eventloop4human:state';
interface StorageSchema {
  version: string;
  state: EventLoopState;
  lastModified: string;
}
```

### 新規スキーマ（追加）

```typescript
// 新しいストレージキーを追加
const TIMER_STORAGE_KEY = 'eventloop4human:timer';
interface TimerStorageSchema {
  version: string;
  timerState: TimerState | null;
  lastModified: string;
}
```

**後方互換性**: 既存のストレージデータには影響なし。タイマー用のキーが存在しない場合は、タイマー状態を `null` として初期化する。

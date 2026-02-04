# Quickstart: タスクタイマー機能

**Feature**: 002-add-task-timer
**Date**: 2026-02-02

## 概要

このガイドでは、タスクタイマー機能の実装を素早く開始するための手順を説明します。

---

## 1. 前提条件

```bash
# 依存関係がインストールされていることを確認
npm install

# 開発サーバーが起動することを確認
npm run dev

# テストが通ることを確認
npm test
```

---

## 2. 実装順序

以下の順序で実装することを推奨します:

### Step 1: 型定義の追加

```bash
# 新規ファイル作成
touch src/types/timer.types.ts
```

`contracts/timer.types.ts` の内容を `src/types/timer.types.ts` にコピーし、`src/types/index.ts` でエクスポートを追加します。

### Step 2: ユーティリティ関数の実装

```bash
# 新規ファイル作成
touch src/utils/timer.ts
```

実装する関数:
- `formatElapsedTime(ms: number): string`
- `formatTimestamp(timestamp: number): string`
- `calculateElapsedTime(state: TimerState, currentTime?: number): number`
- `startTimer(taskId: string): TimerState`
- `pauseTimer(state: TimerState): TimerState`
- `resumeTimer(state: TimerState): TimerState`
- `validateTimerState(state: TimerState): TimerValidationResult`

### Step 3: カスタムフックの実装

```bash
# 新規ファイル作成
touch src/hooks/useTaskTimer.ts
```

`useTaskTimer` フックを実装:

```typescript
// src/hooks/useTaskTimer.ts
import { useState, useEffect, useCallback } from 'react';
import type { TimerState, UseTaskTimerReturn } from '@/types';
import {
  formatElapsedTime,
  formatTimestamp,
  calculateElapsedTime,
  startTimer,
  pauseTimer,
  resumeTimer,
} from '@/utils/timer';

export function useTaskTimer(taskId: string | null): UseTaskTimerReturn {
  // LocalStorageからの復元
  // setIntervalによる更新
  // pause/resume アクション
  // タスクID変更時のリセット
  // ...
}
```

### Step 4: タイマーコンポーネントの実装

```bash
# 新規ファイル作成
touch src/components/task/TaskTimer.tsx
```

`TaskTimer` コンポーネントを実装:

```typescript
// src/components/task/TaskTimer.tsx
import React from 'react';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { theme } from '@/styles/theme';
import type { TaskTimerProps } from '@/types';

export const TaskTimer: React.FC<TaskTimerProps> = ({ taskId, onPause, onResume }) => {
  const timer = useTaskTimer(taskId);

  if (!taskId) return null;

  // タイマー表示UI
  // 一時停止/再開ボタン
  // 開始時刻・再開時刻の表示
  // ...
};
```

### Step 5: CallStackコンポーネントへの統合

`src/components/areas/CallStack.tsx` を更新:

```typescript
// CallStack.tsx に TaskTimer を統合
import { TaskTimer } from '@/components/task/TaskTimer';

export const CallStack: React.FC<CallStackProps> = ({ task, ... }) => {
  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.content}>
        {task && <TaskTimer taskId={task.id} />}
        {/* 既存のTaskCard */}
      </div>
    </div>
  );
};
```

---

## 3. テストの実装

### ユーティリティのテスト

```bash
mkdir -p tests/utils
touch tests/utils/timer.test.ts
```

```typescript
// tests/utils/timer.test.ts
import { describe, it, expect } from 'vitest';
import { formatElapsedTime, formatTimestamp } from '@/utils/timer';

describe('formatElapsedTime', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatElapsedTime(65000)).toBe('01:05');
  });

  it('should format hours as HH:MM:SS', () => {
    expect(formatElapsedTime(3665000)).toBe('1:01:05');
  });
});

describe('formatTimestamp', () => {
  it('should format as MMM D HH:MM:SS', () => {
    const date = new Date('2026-02-02T14:30:45');
    expect(formatTimestamp(date.getTime())).toBe('Feb 2 14:30:45');
  });
});
```

### フックのテスト

```bash
mkdir -p tests/hooks
touch tests/hooks/useTaskTimer.test.ts
```

```typescript
// tests/hooks/useTaskTimer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskTimer } from '@/hooks/useTaskTimer';

describe('useTaskTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it('should start timer when taskId is provided', () => {
    const { result } = renderHook(() => useTaskTimer('task-1'));
    expect(result.current.isRunning).toBe(true);
  });

  it('should pause timer when pause is called', () => {
    const { result } = renderHook(() => useTaskTimer('task-1'));
    act(() => result.current.pause());
    expect(result.current.isPaused).toBe(true);
  });
});
```

---

## 4. スタイルガイドライン

### カラー

```typescript
// タイマー動作中
color: theme.colors.accent.callStack // #ff00ff (マゼンタ)

// タイマー一時停止中
color: `${theme.colors.accent.callStack}88` // 半透明マゼンタ
```

### フォント

```typescript
fontFamily: theme.fonts.mono // 等幅フォント必須
```

### ボタンスタイル

既存の完了/ブロックボタンと同じスタイルを使用:

```typescript
// 既存のTaskCardのボタンスタイルを参照
// シンプルなテキストボタン、ホバー時に背景変更
```

---

## 5. 実装チェックリスト

- [ ] 型定義 (`src/types/timer.types.ts`)
- [ ] ユーティリティ関数 (`src/utils/timer.ts`)
- [ ] カスタムフック (`src/hooks/useTaskTimer.ts`)
- [ ] タイマーコンポーネント (`src/components/task/TaskTimer.tsx`)
- [ ] CallStackへの統合 (`src/components/areas/CallStack.tsx`)
- [ ] ユニットテスト (`tests/utils/timer.test.ts`)
- [ ] フックテスト (`tests/hooks/useTaskTimer.test.ts`)
- [ ] コンポーネントテスト (`tests/components/TaskTimer.test.tsx`)
- [ ] LocalStorage永続化の確認
- [ ] ページリロード後の復元確認

---

## 6. 次のステップ

実装が完了したら、`/speckit.tasks` コマンドで詳細なタスクリストを生成し、段階的に実装を進めてください。

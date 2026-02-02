# Research: タスクタイマー機能

**Feature**: 002-add-task-timer
**Date**: 2026-02-02
**Status**: Complete

## 調査対象

本ドキュメントでは、タスクタイマー機能の実装に必要な技術的決定事項を調査・決定する。

---

## 1. タイマー実装パターン

### 決定: `setInterval` + 開始時刻ベースの計算

### 根拠

- **正確性**: `setInterval`のドリフト問題を回避するため、経過時間は`Date.now() - startTime`で計算
- **バックグラウンドタブ対応**: ブラウザがタブを非アクティブにしても、再描画時に正確な経過時間を計算可能
- **シンプルさ**: React 18の標準的なパターンとして広く使用されている

### 検討した代替案

| 代替案 | 却下理由 |
|-------|---------|
| `requestAnimationFrame` | 1秒間隔の更新には過剰、バッテリー消費が増加 |
| Web Workers | 単純なタイマーには過剰な複雑さ、LocalStorage同期が複雑化 |
| `setTimeout`再帰 | `setInterval`と同等だが、コードが複雑化 |

### 実装パターン

```typescript
// 概念的な実装
const useTaskTimer = (taskId: string | null) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerState = useTimerState(taskId); // LocalStorageから復元

  useEffect(() => {
    if (!taskId || timerState.isPaused) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - timerState.startTime - timerState.totalPausedTime;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, timerState]);

  return { elapsedTime, ...timerState };
};
```

---

## 2. 時刻フォーマット

### 決定: 経過時間は `MM:SS` / `HH:MM:SS`、開始・再開時刻は `MMM D HH:MM:SS`

### 根拠

- **仕様要件**: FR-003（経過時間）、FR-013（開始・再開時刻）で明確に指定
- **一貫性**: ターミナル風の表示（固定幅、等幅フォント）と相性が良い
- **国際化**: 月の英語表記（Jan, Feb, ...）は開発者向けツールとして適切

### 実装

```typescript
// 経過時間フォーマット
function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 開始・再開時刻フォーマット（MMM D HH:MM:SS）
function formatTimestamp(date: Date): string {
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

## 3. 一時停止状態の視覚的フィードバック

### 決定: テキスト色の変更（マゼンタ → 薄いマゼンタ/グレー）+ 点滅なし

### 根拠

- **憲章準拠**: アニメーションは最小限（原則III）
- **アクセシビリティ**: 点滅は視覚障害を持つユーザーに問題を引き起こす可能性
- **シンプルさ**: 色変更のみで状態を明確に区別可能
- **ターミナル美学**: 古典的なターミナルでは色変更で状態を示すのが一般的

### 検討した代替案

| 代替案 | 却下理由 |
|-------|---------|
| 点滅アニメーション | アクセシビリティ問題、ターミナル美学との不整合 |
| アイコン追加 | 装飾的要素の禁止（原則III） |
| ボーダー変更 | 既存のUI要素との一貫性を損なう |

### 実装

```typescript
const timerStyles = {
  running: {
    color: theme.colors.accent.callStack, // #ff00ff (マゼンタ)
  },
  paused: {
    color: `${theme.colors.accent.callStack}88`, // 半透明マゼンタ
  },
};
```

---

## 4. LocalStorage永続化戦略

### 決定: 既存の `StorageSchema` を拡張し、タイマー状態を独立キーで保存

### 根拠

- **後方互換性**: 既存のイベントループ状態と分離することで、マイグレーション不要
- **独立性**: タイマー状態はタスク状態と異なるライフサイクルを持つ
- **シンプルさ**: 既存のストレージユーティリティを再利用可能

### データ構造

```typescript
// 新規キー: 'eventloop4human:timer'
interface TimerStorageSchema {
  version: string; // '1.0.0'
  timerState: TimerState | null;
  lastModified: string;
}

interface TimerState {
  taskId: string;           // 対象タスクのID
  startTime: number;        // 開始時刻（Unix timestamp ms）
  lastResumeTime: number | null; // 最新の再開時刻（Unix timestamp ms）
  isPaused: boolean;        // 一時停止中フラグ
  pauseStartTime: number | null; // 一時停止開始時刻
  totalPausedTime: number;  // 累積一時停止時間（ms）
}
```

### ストレージキー

- **既存**: `eventloop4human:state` - イベントループ状態（変更なし）
- **新規**: `eventloop4human:timer` - タイマー状態

---

## 5. タスクID変更時の挙動

### 決定: タスクがCall Stackから離れたら、タイマー状態をクリア

### 根拠

- **仕様要件**: FR-007「タスクが完了またはブロックされた際にタイマーをリセット」
- **エッジケース対応**: 仕様の「タスクをブロック後、再度コールスタックに戻った場合、タイマーは0からリセット」
- **シンプルさ**: タスクIDベースの状態管理で一貫性を保つ

### 状態遷移

```
[Task enters Call Stack]
    ↓
Timer starts (startTime = now)
    ↓
[User pauses] → isPaused = true, pauseStartTime = now
    ↓
[User resumes] → isPaused = false, lastResumeTime = now, totalPausedTime += (now - pauseStartTime)
    ↓
[Task leaves Call Stack (complete/block)]
    ↓
Timer state cleared (timerState = null)
```

---

## 6. React Hook設計

### 決定: `useTaskTimer` カスタムフックで状態とロジックをカプセル化

### 根拠

- **関心の分離**: UI（TaskTimer）とロジック（useTaskTimer）を分離
- **テスタビリティ**: フック単体でテスト可能
- **再利用性**: 将来的に他のコンポーネントでも使用可能

### インターフェース

```typescript
interface UseTaskTimerReturn {
  // 表示用データ
  elapsedTime: number;        // 経過時間（ms）
  formattedTime: string;      // フォーマット済み経過時間
  startTimestamp: string;     // フォーマット済み開始時刻
  resumeTimestamp: string | null; // フォーマット済み再開時刻（なければnull）
  isPaused: boolean;          // 一時停止中フラグ
  isRunning: boolean;         // タイマー動作中フラグ

  // アクション
  pause: () => void;          // 一時停止
  resume: () => void;         // 再開
}

function useTaskTimer(taskId: string | null): UseTaskTimerReturn;
```

---

## 7. テスト戦略

### 決定: 3層テスト（ユニット、コンポーネント、統合）

### 根拠

- **品質保証**: 憲章のテスト要件に準拠
- **カバレッジ**: ロジック、UI、永続化をそれぞれテスト

### テスト計画

| レイヤー | 対象 | テストフレームワーク |
|---------|------|---------------------|
| ユニット | `formatElapsedTime`, `formatTimestamp` | Vitest |
| ユニット | `useTaskTimer` フック | Vitest + @testing-library/react |
| コンポーネント | `TaskTimer` コンポーネント | Vitest + React Testing Library |
| 統合 | タイマー + LocalStorage 永続化 | Vitest + jsdom |

### 主要テストケース

1. タスクがCall Stackに入った時、タイマーが開始される
2. 一時停止ボタンでタイマーが停止する
3. 再開ボタンでタイマーが継続する
4. ページリロード後、タイマー状態が復元される
5. タスク完了時、タイマーがリセットされる
6. 長時間（1時間以上）の表示が正確である

---

## 結論

すべての技術的決定事項が解決された。Phase 1（設計）に進む準備が整った。

### 主要な決定事項まとめ

| 項目 | 決定 |
|------|------|
| タイマー実装 | `setInterval` + 開始時刻ベース計算 |
| 経過時間フォーマット | `MM:SS` / `HH:MM:SS` |
| 時刻フォーマット | `MMM D HH:MM:SS` |
| 一時停止表示 | 色変更（半透明化）、点滅なし |
| 永続化 | 独立キー `eventloop4human:timer` |
| フック設計 | `useTaskTimer` でロジックをカプセル化 |
| テスト | 3層テスト（ユニット、コンポーネント、統合） |

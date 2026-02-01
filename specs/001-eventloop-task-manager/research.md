# Research: EventLoop4Human 技術調査

**日付**: 2026-02-02
**フェーズ**: Phase 0 - 技術選定と実装パターン調査

## 1. ドラッグ&ドロップライブラリの選定

### 決定: @dnd-kit

**理由**:
- **モダンなAPI**: React 18のConcurrent Modeに完全対応
- **アクセシビリティ**: WAI-ARIA準拠、キーボード操作サポート
- **パフォーマンス**: 仮想化リスト対応、大量のアイテムでも高速
- **TypeScript**: 完全な型サポート、開発体験が優れている
- **柔軟性**: ソート、マルチドラッグ、複数コンテナ間の移動をサポート
- **メンテナンス**: 活発に開発されており、React 18+で推奨

**検討した代替案**:

| ライブラリ | 却下理由 |
|-----------|---------|
| react-beautiful-dnd | React 18のConcurrent Modeで問題あり、メンテナンスが停滞 |
| react-dnd | 低レベルすぎて実装コストが高い、ソート機能が組み込みでない |
| sortablejs/react-sortablejs | jQueryベースの歴史的負債、TypeScript型定義が不完全 |

**実装パターン**:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// 使用例：Task Queue内のソート
<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext items={taskQueue} strategy={verticalListSortingStrategy}>
    {taskQueue.map(task => <TaskCard key={task.id} task={task} />)}
  </SortableContext>
</DndContext>
```

## 2. LocalStorageのベストプラクティス

### データ構造の設計

**決定**: JSON形式でシリアライズ、単一キーで全データ管理

**スキーマ設計**:
```typescript
interface StorageSchema {
  version: string; // スキーマバージョン（将来のマイグレーション用）
  callStack: Task | null; // Call Stackは最大1つ
  microtaskQueue: Task[];
  taskQueue: Task[];
  webAPI: Task[];
  lastModified: string; // ISO 8601形式のタイムスタンプ
}
```

**理由**:
- 単一キー（`eventloop4human:state`）で全データを管理することで、読み書きが効率的
- バージョン管理により、将来的なスキーマ変更に対応可能
- タイムスタンプで最終更新時刻を記録（デバッグ用）

### 容量管理とエラーハンドリング

**LocalStorage容量制限**: ブラウザごとに5-10MB

**実装戦略**:
1. **容量監視**: 保存前にデータサイズをチェック
2. **警告表示**: 容量が80%を超えたら警告を表示
3. **エラーハンドリング**: `QuotaExceededError`をキャッチして適切なメッセージ表示
4. **フォールバック**: LocalStorageが無効の場合、セッションストレージまたはメモリのみで動作

**実装パターン**:
```typescript
function saveToLocalStorage(data: StorageSchema): boolean {
  try {
    const serialized = JSON.stringify(data);
    const sizeInBytes = new Blob([serialized]).size;

    // 容量チェック（5MB想定）
    if (sizeInBytes > 5 * 1024 * 1024 * 0.8) {
      console.warn('LocalStorage usage exceeds 80%');
    }

    localStorage.setItem('eventloop4human:state', serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // 容量超過エラー処理
      alert('ストレージ容量が不足しています。古いタスクを削除してください。');
    }
    return false;
  }
}
```

### データ整合性

**検証戦略**:
- JSON.parseでパースエラーをキャッチ
- スキーマバージョンのチェック
- 必須フィールドの存在確認
- 型チェック（Zodやio-tsは使わず、シンプルな手動チェック）

## 3. ターミナル風UIデザイン

### フォント選定

**決定**: Fira Code（プライマリ）

**理由**:
- **リガチャ**: `=>`, `!=`, `>=`などのコードリガチャが美しい
- **可読性**: 長時間の使用でも目が疲れにくい
- **無料**: OFL (SIL Open Font License) でオープンソース
- **Web対応**: Google Fontsで簡単に導入可能

**フォールバック順序**:
```css
font-family: 'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Menlo', 'Monaco', 'Courier New', monospace;
```

### カラーパレット

**ターミナル風テーマ**: 黒背景＋緑文字

```typescript
const theme = {
  colors: {
    background: {
      primary: '#0a0a0a',      // メイン背景
      secondary: '#1a1a1a',    // パネル背景
      hover: '#2a2a2a',        // ホバー時
    },
    text: {
      primary: '#00ff00',      // メインテキスト（鮮やかな緑）
      secondary: '#00cc00',    // セカンダリテキスト
      muted: '#008800',        // 薄い緑
      error: '#ff0000',        // エラー
      warning: '#ffaa00',      // 警告
    },
    border: {
      default: '#00ff0044',    // 半透明の緑
      active: '#00ff00',       // アクティブ時
      inactive: '#00880044',   // 非アクティブ
    },
    accent: {
      callStack: '#ff00ff',    // Call Stack用（マゼンタ）
      microtask: '#00ffff',    // Microtask Queue用（シアン）
      taskQueue: '#00ff00',    // Task Queue用（緑）
      webAPI: '#ffaa00',       // Web API用（オレンジ）
    }
  },
  fonts: {
    mono: "'Fira Code', 'JetBrains Mono', 'Source Code Pro', monospace",
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    }
  }
};
```

### アニメーション設計

**原則**: さりげなく、しかし視覚的なフィードバックを明確に

**実装パターン**:

1. **タスク移動アニメーション**:
```css
.task-move {
  transition: transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1),
              opacity 250ms ease-out;
}
```

2. **Call Stack投入アニメーション**:
```css
@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.task-to-callstack {
  animation: scaleIn 250ms ease-out;
}
```

3. **完了時のフェードアウト**:
```css
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.task-complete {
  animation: fadeOut 400ms ease-out forwards;
}
```

### レイアウト

**決定**: CSS Gridで4エリアを配置

**レスポンシブ戦略**:
- デスクトップ（> 1024px）: 2x2グリッド
- タブレット（768px - 1024px）: 2x2グリッド（少し狭い）
- モバイル（< 768px）: 縦積み（4つのエリアを縦に配置）

```css
.main-layout {
  display: grid;
  gap: 16px;
  padding: 16px;
  height: 100vh;

  /* デスクトップ */
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "callstack microtask"
    "taskqueue webapi";
}

@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      "callstack"
      "microtask"
      "taskqueue"
      "webapi";
  }
}
```

## 4. イベントループの自動投入ロジック

### 状態管理: useReducer

**決定**: `useReducer`でイベントループ全体の状態を管理

**理由**:
- 複雑な状態遷移を一箇所で管理できる
- イベントループの動作が明確になる（アクションベース）
- テストが容易（pure function）

**Reducer設計**:
```typescript
type EventLoopAction =
  | { type: 'COMPLETE_TASK' }
  | { type: 'BLOCK_TASK' }
  | { type: 'ADD_TASK'; payload: { task: Task; area: AreaType } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; from: AreaType; to: AreaType } }
  | { type: 'REORDER_QUEUE'; payload: { area: AreaType; tasks: Task[] } }
  | { type: 'AUTO_DISPATCH' }; // Call Stack空時の自動投入

function eventLoopReducer(state: EventLoopState, action: EventLoopAction): EventLoopState {
  switch (action.type) {
    case 'COMPLETE_TASK':
      // Call Stackのタスクを削除、次のタスクを投入しない（AUTO_DISPATCHで処理）
      return { ...state, callStack: null };

    case 'AUTO_DISPATCH':
      // Microtask Queue優先、なければTask Queue
      if (state.callStack === null) {
        if (state.microtaskQueue.length > 0) {
          return {
            ...state,
            callStack: state.microtaskQueue[0],
            microtaskQueue: state.microtaskQueue.slice(1),
          };
        } else if (state.taskQueue.length > 0) {
          return {
            ...state,
            callStack: state.taskQueue[0],
            taskQueue: state.taskQueue.slice(1),
          };
        }
      }
      return state;

    // その他のアクション...
  }
}
```

### 自動投入の実装

**useEffect + AUTO_DISPATCHアクション**:
```typescript
useEffect(() => {
  if (state.callStack === null) {
    // Microtask Queueが空になるまで連続処理
    if (state.microtaskQueue.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'AUTO_DISPATCH' });
      }, 300); // アニメーションの後に次のタスクを投入
      return () => clearTimeout(timer);
    } else if (state.taskQueue.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'AUTO_DISPATCH' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }
}, [state.callStack, state.microtaskQueue.length, state.taskQueue.length]);
```

**Microtask連続処理のUX配慮**:
- Microtask Queueに大量のタスクがある場合、すべて連続処理するとUXが悪化
- 対策: 5タスクごとに一時停止し、「続行」ボタンを表示（オプション機能）
- 初期実装では連続処理のみで十分

## 5. Firebase Hosting設定

### 決定: Firebase HostingでSPAをホスティング

**理由**:
- 無料枠が十分（10GB転送/月、1GBストレージ）
- HTTPSデフォルト
- CDN配信で高速
- 簡単なCLIデプロイ

### 設定ファイル: firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

**SPA対応**: すべてのルートを`index.html`にリライト（クライアントサイドルーティング対応）

### デプロイ手順

```bash
# ビルド
npm run build

# Firebase CLIでデプロイ
firebase deploy --only hosting
```

**環境変数**: 不要（バックエンドがないため）

## 6. テスト戦略

### テストツール: Vitest + React Testing Library

**理由**:
- **Vitest**: Viteと統合、設定不要、高速
- **React Testing Library**: ユーザー視点のテスト、アクセシビリティ重視

### テストレベル

1. **単体テスト** (`tests/unit/`):
   - カスタムフック（`useEventLoop`, `useTaskManager`, `useLocalStorage`）
   - ユーティリティ関数（`storage.ts`, `eventLoop.ts`）
   - Reducer関数

2. **統合テスト** (`tests/integration/`):
   - イベントループ全体の動作（Call Stack → Microtask Queue → Task Queueの流れ）
   - LocalStorageとの連携
   - ドラッグ&ドロップの動作

**カバレッジ目標**: 80%以上（ビジネスロジック部分）

### テストパターン例

```typescript
// useEventLoop.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEventLoop } from '../hooks/useEventLoop';

describe('useEventLoop', () => {
  it('Call Stackが空の時、Microtask Queueが優先される', () => {
    const { result } = renderHook(() => useEventLoop());

    act(() => {
      result.current.addTask({ name: 'Task 1' }, 'taskQueue');
      result.current.addTask({ name: 'Microtask 1' }, 'microtaskQueue');
    });

    act(() => {
      result.current.completeTask();
    });

    expect(result.current.callStack?.name).toBe('Microtask 1');
  });
});
```

## まとめ

すべての技術選定が完了し、実装に必要なパターンと設定が明確になりました。次のPhase 1では、これらの調査結果を基にデータモデルと契約を定義します。

### 主要な決定事項

| 項目 | 選定 | 理由 |
|-----|------|------|
| D&Dライブラリ | @dnd-kit | React 18対応、アクセシビリティ、TypeScript |
| データ永続化 | LocalStorage + JSON | シンプル、バックエンド不要 |
| UIテーマ | ダークターミナル風 | エンジニア向け、視認性 |
| フォント | Fira Code | リガチャ、可読性 |
| 状態管理 | useReducer | 複雑な状態遷移、テスト容易 |
| ホスティング | Firebase Hosting | 無料、HTTPS、CDN |
| テスト | Vitest + RTL | Vite統合、ユーザー視点 |

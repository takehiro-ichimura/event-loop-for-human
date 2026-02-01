# Data Model: EventLoop4Human

**日付**: 2026-02-02
**フェーズ**: Phase 1 - データモデル設計

## 概要

EventLoop4Humanのデータモデルは、JavaScriptのイベントループを忠実に再現しつつ、人間のタスク管理に必要な属性を追加した設計になっています。中核となるのは**Task**エンティティと、それを保持する4つの**Area**です。

## エンティティ設計

### 1. Task（タスク）

ユーザーが管理する作業単位を表す中心的なエンティティ。

#### フィールド定義

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|-----|------|------|---------------|
| `id` | `string` | ✅ | タスクの一意識別子（UUID v4） | 自動生成 |
| `name` | `string` | ✅ | タスク名 | 1-200文字、空白のみ不可 |
| `estimatedTime` | `number \| null` | ❌ | 見積もり時間（分単位） | 0以上、null許容 |
| `category` | `string \| null` | ❌ | カテゴリ名 | 0-50文字、null許容 |
| `memo` | `string \| null` | ❌ | メモ | 0-1000文字、null許容 |
| `createdAt` | `string` | ✅ | 作成日時（ISO 8601形式） | 自動生成 |
| `area` | `AreaType` | ✅ | 現在の所属エリア | `'callStack' \| 'microtaskQueue' \| 'taskQueue' \| 'webAPI'` |
| `order` | `number` | ✅ | キュー内の順序（Call Stackでは無視） | 0以上の整数 |

#### TypeScript型定義

```typescript
type AreaType = 'callStack' | 'microtaskQueue' | 'taskQueue' | 'webAPI';

interface Task {
  id: string;
  name: string;
  estimatedTime: number | null;
  category: string | null;
  memo: string | null;
  createdAt: string;
  area: AreaType;
  order: number;
}
```

#### バリデーションルール

```typescript
function validateTask(task: Partial<Task>): string[] {
  const errors: string[] = [];

  // 必須チェック
  if (!task.name || task.name.trim().length === 0) {
    errors.push('タスク名は必須です');
  }

  // 長さチェック
  if (task.name && task.name.length > 200) {
    errors.push('タスク名は200文字以内で入力してください');
  }

  if (task.category && task.category.length > 50) {
    errors.push('カテゴリは50文字以内で入力してください');
  }

  if (task.memo && task.memo.length > 1000) {
    errors.push('メモは1000文字以内で入力してください');
  }

  // 見積もり時間チェック
  if (task.estimatedTime !== null && task.estimatedTime !== undefined) {
    if (task.estimatedTime < 0) {
      errors.push('見積もり時間は0以上で入力してください');
    }
  }

  return errors;
}
```

#### ファクトリー関数

```typescript
function createTask(
  name: string,
  area: AreaType,
  options?: {
    estimatedTime?: number;
    category?: string;
    memo?: string;
  }
): Task {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    estimatedTime: options?.estimatedTime ?? null,
    category: options?.category ?? null,
    memo: options?.memo ?? null,
    createdAt: new Date().toISOString(),
    area,
    order: 0, // 後で設定される
  };
}
```

### 2. EventLoopState（イベントループ状態）

アプリケーション全体の状態を表す複合エンティティ。

#### フィールド定義

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `callStack` | `Task \| null` | Call Stack上の現在のタスク（最大1つ） |
| `microtaskQueue` | `Task[]` | Microtask Queueのタスク配列（順序保証） |
| `taskQueue` | `Task[]` | Task Queueのタスク配列（順序保証） |
| `webAPI` | `Task[]` | Web APIエリアのタスク配列（順序なし） |

#### TypeScript型定義

```typescript
interface EventLoopState {
  callStack: Task | null;
  microtaskQueue: Task[];
  taskQueue: Task[];
  webAPI: Task[];
}
```

#### 状態遷移ルール

1. **Call Stack投入ルール**:
   - Call Stackが空（`null`）の時のみ、新しいタスクを投入可能
   - 優先順位: Microtask Queue > Task Queue
   - Microtask Queueに複数タスクがある場合、すべて連続で処理

2. **タスク移動ルール**:
   - Call Stack → Web API: いつでも可能（ブロック操作）
   - Web API → Microtask Queue: 手動操作
   - Web API → Task Queue: 手動操作
   - Microtask Queue内: 並べ替え可能
   - Task Queue内: 並べ替え可能
   - Web API内: 並べ替え不要（順序なし）

3. **タスク完了ルール**:
   - Call Stack上のタスクのみ完了可能
   - 完了したタスクは削除され、履歴に残らない

### 3. StorageSchema（LocalStorageスキーマ）

LocalStorageに保存されるデータの構造。

#### フィールド定義

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `version` | `string` | スキーマバージョン（セマンティックバージョニング） |
| `state` | `EventLoopState` | イベントループの現在の状態 |
| `lastModified` | `string` | 最終更新日時（ISO 8601形式） |

#### TypeScript型定義

```typescript
interface StorageSchema {
  version: string;
  state: EventLoopState;
  lastModified: string;
}
```

#### ストレージキー

```typescript
const STORAGE_KEY = 'eventloop4human:state' as const;
const STORAGE_VERSION = '1.0.0' as const;
```

#### マイグレーション戦略

将来的なスキーマ変更に対応するため、バージョン管理を実装。

```typescript
function migrateStorage(data: any): StorageSchema {
  const version = data.version || '0.0.0';

  // バージョン1.0.0未満の場合、デフォルト値で初期化
  if (semverLt(version, '1.0.0')) {
    console.warn('Legacy storage detected, resetting to default');
    return createDefaultStorage();
  }

  // 将来的なバージョンアップ時の変換処理をここに追加
  // if (semverLt(version, '2.0.0')) { ... }

  return data as StorageSchema;
}

function createDefaultStorage(): StorageSchema {
  return {
    version: STORAGE_VERSION,
    state: {
      callStack: null,
      microtaskQueue: [],
      taskQueue: [],
      webAPI: [],
    },
    lastModified: new Date().toISOString(),
  };
}
```

## データフロー

### 1. タスク追加フロー

```
ユーザー入力
  ↓
createTask() → バリデーション
  ↓
指定されたエリアに追加（order自動設定）
  ↓
EventLoopState更新
  ↓
LocalStorage保存
  ↓
（Call Stackが空 && 追加先がキュー）
  ↓
自動投入トリガー
```

### 2. タスク完了フロー

```
Call Stack上のタスクで「完了」ボタンクリック
  ↓
タスクを削除（履歴に残さない）
  ↓
Call Stack = null
  ↓
EventLoopState更新
  ↓
LocalStorage保存
  ↓
自動投入トリガー
  ↓
Microtask Queue優先でチェック
  ↓
  あり → Call Stackに投入（連続処理）
  なし → Task Queueをチェック
    ↓
    あり → Call Stackに投入
    なし → 何もしない
```

### 3. ブロック（Call Stack → Web API）フロー

```
Call Stack上のタスクで「ブロック」ボタンクリック
  ↓
タスクのareaを'webAPI'に変更
  ↓
Call Stack = null
  ↓
Web API配列に追加
  ↓
EventLoopState更新
  ↓
LocalStorage保存
  ↓
自動投入トリガー
```

### 4. 並べ替えフロー（キュー内）

```
ドラッグ&ドロップ開始
  ↓
@dnd-kitのonDragEndイベント
  ↓
新しい順序で配列を再構築
  ↓
各タスクのorder更新
  ↓
EventLoopState更新
  ↓
LocalStorage保存
```

## インデックス戦略

LocalStorageはキーバリューストアのため、インデックスは不要。すべてのデータを単一のキーで管理することで、読み書きが効率的。

## データサイズの見積もり

### 1タスクあたりのサイズ

```typescript
const exampleTask: Task = {
  id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // 36 bytes
  name: 'タスク名', // 平均50 bytes
  estimatedTime: 30, // 8 bytes
  category: 'カテゴリ', // 平均20 bytes
  memo: 'メモ', // 平均100 bytes
  createdAt: '2026-02-02T00:00:00.000Z', // 24 bytes
  area: 'taskQueue', // 15 bytes
  order: 0, // 8 bytes
};

// 合計: 約261 bytes/タスク
```

### 容量計算

| タスク数 | サイズ（概算） | 備考 |
|---------|--------------|------|
| 10タスク | 約2.6KB | 最小構成 |
| 50タスク | 約13KB | 推奨上限 |
| 100タスク | 約26KB | 理論上の最大 |

LocalStorageの容量制限（5-10MB）に対して、100タスクでも0.5%未満の使用量なので、容量面での問題はない。

## エラーハンドリング

### LocalStorageエラー

| エラー | 発生条件 | 対応 |
|-------|---------|------|
| `QuotaExceededError` | 容量超過 | アラート表示、古いタスクの削除を提案 |
| `SecurityError` | プライベートモード | セッションストレージにフォールバック |
| `SyntaxError` | JSON.parse失敗 | ストレージをリセット、デフォルト値で初期化 |

### バリデーションエラー

ユーザー入力時にリアルタイムでバリデーションを実行し、エラーメッセージを表示。送信前にすべてのエラーを解決させる。

## パフォーマンス考慮事項

### 1. LocalStorageの読み書き最適化

- **Debounce**: 連続した状態変更を300msでdebounceして保存回数を削減
- **差分チェック**: 状態が実際に変更された場合のみ保存

```typescript
const debouncedSave = debounce((state: EventLoopState) => {
  const schema: StorageSchema = {
    version: STORAGE_VERSION,
    state,
    lastModified: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
}, 300);
```

### 2. レンダリング最適化

- **React.memo**: TaskCardコンポーネントをメモ化
- **useCallback**: イベントハンドラーをメモ化
- **useMemo**: 計算結果をキャッシュ

### 3. アニメーション最適化

- **CSS Transform**: `transform`と`opacity`のみを使用（GPU加速）
- **will-change**: アニメーション対象要素に`will-change`を指定

## セキュリティ考慮事項

### XSS対策

- Reactのデフォルトのエスケープ機能に依存
- `dangerouslySetInnerHTML`は使用しない
- ユーザー入力はすべてテキストノードとして扱う

### LocalStorageのセキュリティ

- センシティブな情報（パスワード、個人情報など）は保存しない
- タスク名、カテゴリ、メモのみ（ユーザーが自己責任で管理）

## まとめ

EventLoop4Humanのデータモデルは、シンプルで拡張可能な設計になっています。中核となるTaskエンティティは、JavaScriptのイベントループの動作を忠実に再現しつつ、実用的なタスク管理機能を提供します。LocalStorageベースの永続化により、バックエンド不要で動作し、ユーザーのプライバシーを保護します。

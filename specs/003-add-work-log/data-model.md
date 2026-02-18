# Data Model: 作業ログ機能

**Feature**: 003-add-work-log | **Date**: 2026-02-14

## エンティティ定義

### LogEntry（ログエントリ）

タスクの1回の操作を記録する最小単位。

```typescript
interface LogEntry {
  /** ログエントリの一意識別子（UUID v4） */
  id: string;

  /** 操作対象のタスクID */
  taskId: string;

  /** 操作対象のタスク名（ログ閲覧時にタスクが削除されていても表示可能にするため、スナップショットとして保持） */
  taskName: string;

  /** 操作の種別 */
  operation: LogOperation;

  /** 操作のタイムスタンプ（ISO 8601形式） */
  timestamp: string;

  /** 移動元エリア（操作種別が moved, blocked の場合のみ。created の場合は null） */
  fromArea: AreaType | null;

  /** 移動先エリア（操作種別が created, moved, blocked の場合） */
  toArea: AreaType | null;

  /** 作成〜完了の経過時間（ミリ秒）。completed 操作の場合のみ有効 */
  elapsedTime: number | null;
}
```

### LogOperation（操作種別）

```typescript
type LogOperation =
  | 'created'   // タスク作成
  | 'moved'     // エリア間移動（AUTO_DISPATCH, MOVE_TASK）
  | 'completed' // タスク完了
  | 'blocked'   // ブロック（Call Stack → Web API）
  | 'paused'    // タイマー一時停止
  | 'resumed';  // タイマー再開
```

### WorkLogStorageSchema（ストレージスキーマ）

```typescript
interface WorkLogStorageSchema {
  /** スキーマバージョン（セマンティックバージョニング） */
  version: string;

  /** ログエントリの配列（新しい順にソート済み） */
  entries: LogEntry[];

  /** 最終更新日時（ISO 8601形式） */
  lastModified: string;
}
```

### WorkSummary（作業サマリー）

集計結果を表す一時的なデータ構造。ストレージには保存せず、表示時にリアルタイム計算する。

```typescript
interface WorkSummary {
  /** 集計期間の開始日（YYYY-MM-DD形式） */
  periodStart: string;

  /** 集計期間の終了日（YYYY-MM-DD形式） */
  periodEnd: string;

  /** 期間内の完了タスク数 */
  completedCount: number;

  /** 完了タスクの平均所要時間（ミリ秒） */
  averageElapsedTime: number | null;

  /** 日別内訳 */
  dailyBreakdown: DailyStats[];
}
```

### DailyStats（日別統計）

```typescript
interface DailyStats {
  /** 日付（YYYY-MM-DD形式） */
  date: string;

  /** その日の完了タスク数 */
  completedCount: number;

  /** その日の完了タスク平均所要時間（ミリ秒） */
  averageElapsedTime: number | null;
}
```

### DateFilter（日付フィルタ）

```typescript
interface DateFilter {
  /** フィルタ開始日（YYYY-MM-DD形式、空文字列の場合は制限なし） */
  startDate: string;

  /** フィルタ終了日（YYYY-MM-DD形式、空文字列の場合は制限なし） */
  endDate: string;
}
```

## 関係図

```text
┌──────────────────────────────────────┐
│ WorkLogStorageSchema                 │
│  version: string                     │
│  entries: LogEntry[]  ──────────┐    │
│  lastModified: string           │    │
└─────────────────────────────────┼────┘
                                  │
                                  ▼
┌──────────────────────────────────────┐
│ LogEntry                             │
│  id: string                          │
│  taskId: string ─── ref → Task.id    │
│  taskName: string (snapshot)         │
│  operation: LogOperation             │
│  timestamp: string                   │
│  fromArea: AreaType | null           │
│  toArea: AreaType | null             │
│  elapsedTime: number | null          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ WorkSummary (計算結果、非永続化)       │
│  periodStart: string                 │
│  periodEnd: string                   │
│  completedCount: number              │
│  averageElapsedTime: number | null   │
│  dailyBreakdown: DailyStats[]        │
└──────────────────────────────────────┘
```

## バリデーションルール

| フィールド | ルール |
|-----------|--------|
| `LogEntry.id` | UUID v4形式、必須 |
| `LogEntry.taskId` | 文字列、必須、空文字列不可 |
| `LogEntry.taskName` | 1〜200文字、必須 |
| `LogEntry.operation` | `LogOperation` のいずれか、必須 |
| `LogEntry.timestamp` | ISO 8601形式、必須 |
| `LogEntry.fromArea` | `moved` / `blocked` 時は必須、それ以外は null |
| `LogEntry.toArea` | `created` / `moved` / `blocked` 時は必須、それ以外は null |
| `LogEntry.elapsedTime` | `completed` 時は 0以上の数値が必須、それ以外は null |

## 状態遷移

ログエントリには状態遷移はない（一度作成されたら変更・更新されない、イミュータブルなレコード）。

## ストレージ定数

```typescript
/** ログ用のLocalStorageキー */
const WORKLOG_STORAGE_KEY = 'eventloop4human:logs' as const;

/** ログストレージの現在のバージョン */
const WORKLOG_STORAGE_VERSION = '1.0.0' as const;

/** ログの最大保持件数 */
const WORKLOG_MAX_ENTRIES = 5000 as const;

/** 表示時の初期読み込み件数 */
const WORKLOG_PAGE_SIZE = 50 as const;
```

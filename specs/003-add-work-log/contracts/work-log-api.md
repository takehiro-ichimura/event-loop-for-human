# 内部API契約: 作業ログ機能

**Feature**: 003-add-work-log | **Date**: 2026-02-14

本ドキュメントは作業ログ機能の内部API（フック・ユーティリティ関数）の契約を定義する。
外部HTTP APIは存在せず、すべてクライアントサイドのTypeScript関数として提供される。

---

## 1. useWorkLog フック

### 概要

作業ログの記録・取得・分析・管理を統合するカスタムフック。

### シグネチャ

```typescript
function useWorkLog(): UseWorkLogReturn;

interface UseWorkLogReturn {
  /** 全ログエントリ（新しい順） */
  entries: LogEntry[];

  /** フィルタ適用後のログエントリ */
  filteredEntries: LogEntry[];

  /** 現在の日付フィルタ */
  dateFilter: DateFilter;

  /** 日付フィルタを設定 */
  setDateFilter: (filter: DateFilter) => void;

  /** ログエントリを記録 */
  recordLog: (params: RecordLogParams) => void;

  /** 指定期間のサマリーを計算 */
  getSummary: (startDate: string, endDate: string) => WorkSummary;

  /** 全ログをクリア（確認は呼び出し側で実施） */
  clearAllLogs: () => void;

  /** ログをエクスポート */
  exportLogs: (format: 'csv' | 'json') => void;

  /** ログ件数 */
  totalCount: number;

  /** ストレージ読み込み完了フラグ */
  isLoaded: boolean;
}
```

### RecordLogParams

```typescript
interface RecordLogParams {
  /** タスクID */
  taskId: string;

  /** タスク名 */
  taskName: string;

  /** 操作種別 */
  operation: LogOperation;

  /** 移動元エリア */
  fromArea?: AreaType;

  /** 移動先エリア */
  toArea?: AreaType;

  /** 経過時間（ミリ秒、completed操作のみ） */
  elapsedTime?: number;
}
```

### 動作仕様

| メソッド | 動作 | エラー時 |
|---------|------|---------|
| `recordLog` | エントリを作成し配列先頭に追加。5000件超過時は末尾（最古）を削除。LocalStorageに即座保存 | console.errorでログ出力、UIには影響しない |
| `setDateFilter` | フィルタを更新し、`filteredEntries` を再計算 | 無効な日付の場合は全件表示にフォールバック |
| `getSummary` | 指定期間のログから完了タスクを抽出し集計 | 該当データなしの場合は completedCount: 0, averageElapsedTime: null |
| `clearAllLogs` | LocalStorageのログデータを完全削除、entries を空配列にリセット | StorageResult で結果通知 |
| `exportLogs` | `filteredEntries` を指定形式でダウンロード（フィルタ未設定時は全件） | Blob生成失敗時はconsole.error |

---

## 2. workLogStorage ユーティリティ

### 概要

ログデータのLocalStorage永続化操作を提供する純粋なユーティリティ関数群。

### 関数一覧

```typescript
/** ログデータを読み込み */
function loadWorkLogs(): StorageResult<LogEntry[]>;

/** ログデータを保存（全件上書き） */
function saveWorkLogs(entries: LogEntry[]): StorageResult<void>;

/** ログデータをクリア */
function clearWorkLogs(): StorageResult<void>;

/** ログストレージのメタ情報を取得 */
function getWorkLogMetadata(): StorageResult<{
  entryCount: number;
  sizeInBytes: number;
  version: string;
  lastModified: string;
}>;
```

### ストレージフォーマット

```json
{
  "version": "1.0.0",
  "entries": [
    {
      "id": "uuid-v4",
      "taskId": "task-uuid",
      "taskName": "メールの返信を書く",
      "operation": "completed",
      "timestamp": "2026-02-14T10:30:00.000Z",
      "fromArea": null,
      "toArea": null,
      "elapsedTime": 1800000
    }
  ],
  "lastModified": "2026-02-14T10:30:00.000Z"
}
```

---

## 3. workLogExport ユーティリティ

### 概要

ログデータのCSV/JSONファイルエクスポート機能。

### 関数一覧

```typescript
/** CSV形式でエクスポート（ブラウザダウンロード） */
function exportToCSV(entries: LogEntry[]): void;

/** JSON形式でエクスポート（ブラウザダウンロード） */
function exportToJSON(entries: LogEntry[]): void;
```

### CSVフォーマット

```csv
ID,タスクID,タスク名,操作,タイムスタンプ,移動元,移動先,経過時間(ms)
uuid-1,task-1,メールの返信を書く,completed,2026-02-14T10:30:00.000Z,,,1800000
uuid-2,task-1,メールの返信を書く,created,2026-02-14T10:00:00.000Z,,taskQueue,
```

**CSV仕様**:
- UTF-8 BOM付き（`\uFEFF` プレフィックス）
- ヘッダー行あり（日本語ラベル）
- カンマ区切り、ダブルクォート囲み（タスク名にカンマ等が含まれる場合）
- null値は空文字列

### JSONフォーマット

```json
{
  "exportedAt": "2026-02-14T12:00:00.000Z",
  "totalEntries": 150,
  "entries": [...]
}
```

---

## 4. コンポーネント間データフロー

```text
┌─────────────────────────────────────────────────────────┐
│ App.tsx                                                  │
│                                                          │
│  useEventLoop() ──── state ────┐                        │
│  useTaskTimer() ── timerState ─┤                        │
│  useWorkLog() ◄────────────────┤                        │
│    │                            │                        │
│    │ recordLog(...)  ◄── ハンドラから呼び出し              │
│    │                                                     │
│    ├── entries ──────────┐                               │
│    ├── filteredEntries ──┤                               │
│    ├── getSummary() ─────┤                               │
│    └── exportLogs() ─────┤                               │
│                           ▼                              │
│  ┌──────────────────────────────┐                       │
│  │ SidebarTabs                  │                       │
│  │  ├── [タスク追加] TaskForm    │                       │
│  │  └── [ログ] WorkLogPanel     │                       │
│  │       ├── WorkLogFilter      │                       │
│  │       ├── WorkLogList        │                       │
│  │       ├── WorkLogAnalysis    │                       │
│  │       └── WorkLogActions     │                       │
│  └──────────────────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## 5. エラーハンドリング方針

| 操作 | エラー時の振る舞い |
|------|-------------------|
| ログ記録 | 失敗してもUI操作をブロックしない。console.errorのみ |
| ログ読み込み | パースエラー時は空配列にフォールバック |
| ログクリア | 結果をStorageResultで返す。UIで成否を表示 |
| エクスポート | Blob生成/ダウンロード失敗時はconsole.error。空データ時は「ログがありません」メッセージ |
| 容量超過 | 古いエントリを自動削除してリトライ |

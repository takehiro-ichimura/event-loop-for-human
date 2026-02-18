# Implementation Plan: 作業ログ機能

**Branch**: `003-add-work-log` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-add-work-log/spec.md`

## Summary

タスク操作（作成・移動・完了・ブロック・一時停止・再開）の自動ログ記録、時系列一覧表示、日付フィルタ、期間別サマリー分析（完了タスク数・平均所要時間・日別バーチャート）、全ログクリア、CSV/JSONエクスポート機能を実装する。既存のLocalStorage永続化インフラを拡張し、ログ専用のストレージキーで分離管理する。UIはサイドバーの2タブ構成（タスク追加 / ログ）として、ログタブ内に一覧と分析サブセクションを配置する。

## Technical Context

**Language/Version**: TypeScript 5.6.x
**Primary Dependencies**: React 18.3.x, React DOM 18.3.x, @dnd-kit/core 6.x, @dnd-kit/sortable 8.x
**Storage**: LocalStorage（既存インフラを拡張、ログ専用キー `eventloop4human:logs` を新設）
**Testing**: Vitest 1.4.x + @testing-library/react 14.x + @testing-library/user-event 14.x
**Target Platform**: Web（モダンブラウザ、モバイル対応 320px〜）
**Project Type**: Single（React SPA、Vite 5.x ビルド）
**Performance Goals**: ログ記録100ms以内、1000件表示2秒以内、フィルタ1秒以内
**Constraints**: LocalStorage 5MB制限、ログ最大5000件、古い順自動削除
**Scale/Scope**: 個人利用、ログ5000件まで

## Constitution Check

*GATE: Phase 0 開始前に通過必須。Phase 1 設計後に再チェック。*

### I. シングルスレッド実行の原則

| チェック項目 | 状態 | 説明 |
|------------|------|------|
| Call Stack は 0 or 1 タスクのみ | ✅ 準拠 | ログ機能はCall Stackの制約に影響しない。ログはバックグラウンドで記録されるのみ |
| 複数タスク同時実行の示唆なし | ✅ 準拠 | ログ一覧は過去の記録であり、同時実行を示唆しない |
| タスク切り替えは明示的 | ✅ 準拠 | ログの閲覧・分析はタスク操作のフローに介入しない |

### II. 優先度自動化の原則

| チェック項目 | 状態 | 説明 |
|------------|------|------|
| Microtask > Task の優先順位維持 | ✅ 準拠 | ログ機能は優先順位ロジックに変更を加えない |
| ユーザーによる優先度上書き不可 | ✅ 準拠 | ログは読み取り専用の履歴データ |

### III. ターミナル美学の原則

| チェック項目 | 状態 | 説明 |
|------------|------|------|
| ダークターミナルテーマ | ✅ 準拠 | 既存テーマ（#0a0a0a背景 + #00ff00テキスト）を使用 |
| 等幅フォント | ✅ 準拠 | 既存フォント設定を継承 |
| 機能的アクセントカラー | ✅ 準拠 | ログエントリの操作種別表示にエリア別アクセントカラーを活用 |
| アニメーション最小限 | ✅ 準拠 | タブ切替のみ、150ms以内のトランジション |
| 装飾的要素の禁止 | ✅ 準拠 | テキストベースのバーチャート（`████░░░░`）を使用、グラフライブラリ不使用 |
| UI複雑さの制約 | ⚠️ 正当化必要 | サイドバーにタブUIを追加（下記「Complexity Tracking」で正当化） |

**GATE 結果**: ✅ 通過（1件の複雑さ追加を正当化付きで承認）

## Project Structure

### Documentation (this feature)

```text
specs/003-add-work-log/
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 技術調査結果
├── data-model.md        # Phase 1: データモデル定義
├── quickstart.md        # Phase 1: クイックスタートガイド
├── contracts/           # Phase 1: 内部API契約
│   └── work-log-api.md  # ログ操作の内部API仕様
└── tasks.md             # Phase 2: タスク一覧（/speckit.tasks で生成）
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── areas/           # 既存: 4エリアコンポーネント（変更なし）
│   ├── layout/
│   │   ├── MainLayout.tsx        # 変更: sidebar propの型をReactNodeに維持
│   │   └── ErrorBoundary.tsx     # 既存（変更なし）
│   ├── task/
│   │   ├── TaskForm.tsx          # 既存（変更なし）
│   │   └── ...                   # 既存コンポーネント（変更なし）
│   ├── sidebar/                  # 新規: サイドバータブ管理
│   │   └── SidebarTabs.tsx       # 新規: タブ切替コンポーネント
│   └── worklog/                  # 新規: 作業ログ関連コンポーネント
│       ├── WorkLogPanel.tsx      # 新規: ログタブのメインパネル
│       ├── WorkLogList.tsx       # 新規: ログ一覧表示
│       ├── WorkLogFilter.tsx     # 新規: 日付フィルタ
│       ├── WorkLogAnalysis.tsx   # 新規: 分析サブセクション
│       ├── WorkLogActions.tsx    # 新規: クリア・エクスポートアクション
│       └── DailyBarChart.tsx     # 新規: テキストベースバーチャート
├── hooks/
│   ├── useEventLoop.ts           # 既存（変更なし: reducerへのログ記録は外部から行う）
│   ├── useLocalStorage.ts        # 既存（変更なし）
│   ├── useTaskTimer.ts           # 既存（変更なし）
│   └── useWorkLog.ts             # 新規: ログ記録・取得・分析ロジック
├── types/
│   ├── index.ts                  # 変更: ログ型のre-export追加
│   ├── worklog.types.ts          # 新規: ログエントリ・サマリー型定義
│   └── ...                       # 既存型定義（変更なし）
├── utils/
│   ├── storage.ts                # 既存（変更なし）
│   ├── workLogStorage.ts         # 新規: ログ専用ストレージ操作
│   └── workLogExport.ts          # 新規: CSV/JSONエクスポート
├── styles/
│   ├── theme.ts                  # 既存（変更なし: 既存カラーで十分）
│   └── globals.css               # 既存（変更なし、または最小限のレスポンシブ追加）
├── App.tsx                       # 変更: SidebarTabs統合、ログ記録フック接続
└── main.tsx                      # 既存（変更なし）

tests/
├── setup.ts                      # 既存
├── utils/
│   ├── timer.test.ts             # 既存
│   ├── workLogStorage.test.ts    # 新規: ストレージ操作テスト
│   └── workLogExport.test.ts     # 新規: エクスポート機能テスト
├── hooks/
│   └── useWorkLog.test.ts        # 新規: フックのテスト
└── components/
    └── worklog/
        ├── WorkLogList.test.ts   # 新規: ログ一覧テスト
        └── WorkLogAnalysis.test.ts # 新規: 分析機能テスト
```

**Structure Decision**: 既存のSingle SPA構造を維持。ログ関連は `components/worklog/`、`hooks/useWorkLog.ts`、`types/worklog.types.ts`、`utils/workLogStorage.ts` に分離配置。既存コンポーネントへの変更は `App.tsx`（タブ統合とログ記録接続）のみに限定する。

## Complexity Tracking

> Constitution Check 原則III「UI複雑さの制約」の違反を正当化

| 違反 | 必要な理由 | より単純な代替案を却下した理由 |
|------|-----------|------------------------------|
| サイドバーにタブUI追加 | ユーザーが作業ログにアクセスするための最小限のナビゲーション。仕様で2タブ構成が決定済み | モーダルやルーティングはさらに複雑。タブは2つのみで、既存のサイドバー内に収まるため複雑さの増加は最小限 |
| 分析サブセクション | テキストベースのバーチャートと数値テーブルの組み合わせ。ターミナル美学に準拠したASCII表現 | 外部グラフライブラリの追加は装飾的要素の禁止に違反。テキストベースなら等幅フォントとの親和性が高い |

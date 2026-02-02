# Implementation Plan: タスクタイマー機能

**Branch**: `002-add-task-timer` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-task-timer/spec.md`

## Summary

コールスタックで実行中のタスクの経過時間をリアルタイムで表示し、一時停止/再開機能を提供するタイマー機能を実装する。タイマー状態はLocalStorageに永続化され、ページリロードやブラウザ再起動後も復元される。ターミナル美学に準拠したUI（マゼンタアクセント、等幅フォント）でコールスタックエリアに統合する。

## Technical Context

**Language/Version**: TypeScript 5.6.x, React 18.3.x
**Primary Dependencies**: React, React DOM（既存）、追加ライブラリ不要
**Storage**: LocalStorage（既存の永続化インフラを拡張）
**Testing**: Vitest + React Testing Library + jsdom
**Target Platform**: Web（モダンブラウザ、Chrome/Firefox/Safari/Edge）
**Project Type**: Single page application (SPA)
**Performance Goals**: タイマー更新は1秒間隔、UI応答は100ms以内
**Constraints**: 既存のLocalStorageスキーマとの後方互換性を維持
**Scale/Scope**: 単一タスクのタイマー管理（Call Stackは常に0または1タスク）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 原則I: シングルスレッド実行の原則 ✅ PASS

| チェック項目 | 評価 | 根拠 |
|------------|------|------|
| Call Stackのタスク数制限（0または1） | ✅ | タイマーは単一タスクのみを対象とし、複数タスクの同時計測を行わない |
| マルチタスクの示唆なし | ✅ | タイマーは現在実行中のタスクの「集中時間」を可視化し、シングルタスク実行を強化する |
| タスク切り替えの明示性 | ✅ | タスク完了/ブロック時にタイマーがリセットされ、切り替えが明確になる |

### 原則II: 優先度自動化の原則 ✅ PASS

| チェック項目 | 評価 | 根拠 |
|------------|------|------|
| Microtask優先の維持 | ✅ | タイマー機能は優先度システムに影響しない（表示機能のみ） |
| ユーザーによる優先度上書き禁止 | ✅ | タイマーは優先度を変更する機能を持たない |
| キュー配置ルールの維持 | ✅ | タイマーはCall Stack内のタスク表示に限定される |

### 原則III: ターミナル美学の原則 ✅ PASS

| チェック項目 | 評価 | 根拠 |
|------------|------|------|
| ダークターミナルテーマ | ✅ | 既存のテーマ（黒背景#0a0a0a、緑テキスト#00ff00）を継承 |
| 等幅フォント | ✅ | 既存のFira Code等を使用 |
| Call Stackアクセントカラー | ✅ | マゼンタ(#ff00ff)をタイマー表示に適用 |
| アニメーション最小限 | ✅ | 一時停止状態の視覚的フィードバックのみ（点滅または色変更、150-400ms） |
| 装飾的要素の禁止 | ✅ | タイマー表示はテキストベース、グラデーション/影/アイコンなし |
| UI複雑さの制限 | ✅ | 一時停止ボタンは既存の完了/ブロックボタンと同じスタイルで統一 |

## Project Structure

### Documentation (this feature)

```text
specs/002-add-task-timer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── areas/
│   │   └── CallStack.tsx       # タイマー表示を統合
│   └── task/
│       └── TaskTimer.tsx       # [NEW] タイマーコンポーネント
├── hooks/
│   └── useTaskTimer.ts         # [NEW] タイマーロジックのカスタムフック
├── types/
│   ├── timer.types.ts          # [NEW] タイマー関連の型定義
│   └── storage.types.ts        # 拡張: タイマー状態の永続化スキーマ
├── utils/
│   └── timer.ts                # [NEW] 時刻フォーマット等のユーティリティ
└── styles/
    └── theme.ts                # 必要に応じて拡張

tests/
├── hooks/
│   └── useTaskTimer.test.ts    # [NEW] タイマーフックのユニットテスト
├── components/
│   └── TaskTimer.test.tsx      # [NEW] タイマーコンポーネントのテスト
└── utils/
    └── timer.test.ts           # [NEW] ユーティリティのテスト
```

**Structure Decision**: 既存のSPAアーキテクチャを維持し、タイマー機能を独立したコンポーネント/フックとして追加する。Call Stackコンポーネントにタイマーを統合することで、シングルスレッド実行の原則に準拠する。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

憲章違反なし。追加の複雑さは最小限に抑えられている:

| 追加要素 | 正当化理由 |
|---------|-----------|
| TaskTimer コンポーネント | 既存のTaskCardとの関心の分離、再利用性の確保 |
| useTaskTimer フック | ロジックとUIの分離、テスタビリティの向上 |
| LocalStorage スキーマ拡張 | 既存のマイグレーションインフラを活用、後方互換性を維持 |

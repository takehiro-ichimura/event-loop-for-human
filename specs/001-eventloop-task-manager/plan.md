# Implementation Plan: EventLoop4Human - イベントループ式タスク管理アプリ

**Branch**: `001-eventloop-task-manager` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-eventloop-task-manager/spec.md`

## Summary

JavaScriptのイベントループ（Call Stack、Microtask Queue、Task Queue、Web API）の仕組みを人間のタスク管理に応用したWebアプリケーションを構築する。React + TypeScript + Viteで実装し、LocalStorageでデータを永続化する。ターミナル風のダークテーマUIで、エンジニアが直感的にイベントループの動作を体験しながらタスク管理できる教育的かつ実用的なツールを提供する。

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x
**Primary Dependencies**:
- Vite (ビルドツール)
- @dnd-kit/core, @dnd-kit/sortable (ドラッグ&ドロップ)
- Firebase Hosting (デプロイ先)

**Storage**: LocalStorage (ブラウザ標準API、バックエンド不要)
**Testing**: Vitest (Viteエコシステム推奨), React Testing Library
**Target Platform**: モダンブラウザ (Chrome, Firefox, Safari, Edge 最新版)
**Project Type**: Web (フロントエンドのみ、SPAアプリケーション)
**Performance Goals**:
- タスク操作のレスポンス < 1秒
- 50タスクでの応答性維持
- ページロード時のデータ復元 < 2秒

**Constraints**:
- LocalStorage容量制限 (5-10MB)
- ブラウザのみで動作（オフライン可能）
- 認証・ユーザー管理不要（ローカルのみ）

**Scale/Scope**:
- 単一ユーザー向け
- 4つのエリア（UI領域）
- 最大100タスク程度を想定

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**注**: プロジェクトのconstitution.mdがテンプレート状態のため、一般的なベストプラクティスに基づいて評価します。

### 評価項目

- ✅ **シンプルさ**: フロントエンドのみ、バックエンド不要、認証不要でスコープが明確
- ✅ **テスト可能性**: コンポーネント単位、イベントループロジック単位でテスト可能
- ✅ **技術スタック**: React + TypeScript + Viteは実績のある標準的な構成
- ✅ **依存関係**: 最小限（dnd-kit、テストライブラリのみ）
- ✅ **デプロイ**: Firebase Hostingは静的サイトに適切

**結論**: Constitution違反なし。シンプルで実現可能な設計。

## Project Structure

### Documentation (this feature)

```text
specs/001-eventloop-task-manager/
├── spec.md              # 機能仕様書
├── plan.md              # このファイル（実装計画）
├── research.md          # Phase 0 調査結果
├── data-model.md        # Phase 1 データモデル
├── quickstart.md        # Phase 1 クイックスタート
├── contracts/           # Phase 1 型定義・インターフェース
│   ├── task.types.ts    # タスク関連の型定義
│   ├── area.types.ts    # エリア関連の型定義
│   └── storage.types.ts # LocalStorage関連の型定義
└── tasks.md             # Phase 2（/speckit.tasksで生成）
```

### Source Code (repository root)

```text
event-loop-for-human/
├── src/
│   ├── components/       # Reactコンポーネント
│   │   ├── areas/        # 4つのエリアコンポーネント
│   │   │   ├── CallStack.tsx
│   │   │   ├── MicrotaskQueue.tsx
│   │   │   ├── TaskQueue.tsx
│   │   │   └── WebAPI.tsx
│   │   ├── task/         # タスク関連コンポーネント
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   └── layout/       # レイアウトコンポーネント
│   │       ├── App.tsx
│   │       └── MainLayout.tsx
│   ├── hooks/            # カスタムフック
│   │   ├── useEventLoop.ts    # イベントループロジック
│   │   ├── useTaskManager.ts  # タスク管理
│   │   └── useLocalStorage.ts # LocalStorage操作
│   ├── types/            # 型定義（contracts/からコピー）
│   │   ├── task.types.ts
│   │   ├── area.types.ts
│   │   └── storage.types.ts
│   ├── utils/            # ユーティリティ関数
│   │   ├── storage.ts    # LocalStorage操作
│   │   └── eventLoop.ts  # イベントループロジック
│   ├── styles/           # スタイル
│   │   ├── globals.css   # グローバルスタイル（ターミナル風）
│   │   └── theme.ts      # テーマ定義
│   ├── main.tsx          # エントリーポイント
│   └── App.tsx           # ルートコンポーネント
├── tests/
│   ├── unit/             # 単体テスト
│   │   ├── hooks/
│   │   └── utils/
│   └── integration/      # 統合テスト
│       └── eventLoop.test.tsx
├── public/               # 静的ファイル
├── index.html
├── vite.config.ts        # Vite設定
├── tsconfig.json         # TypeScript設定
├── package.json
└── firebase.json         # Firebase Hosting設定
```

**Structure Decision**: フロントエンドのみのSPAアプリケーションなので、Option 1（Single project）をベースに、Reactアプリケーションの標準的な構造を採用。`src/components`でUI、`src/hooks`でロジック、`src/utils`でヘルパー関数を分離し、関心の分離を実現。

## Complexity Tracking

> **Constitution Check で違反がないため、このセクションは不要**

## Phase 0: Outline & Research

### 調査が必要な項目

1. **dnd-kit vs react-beautiful-dnd**: ドラッグ&ドロップライブラリの選定
2. **LocalStorageのベストプラクティス**: データ構造、容量管理、エラーハンドリング
3. **ターミナル風UIデザイン**: フォント選定、カラーパレット、アニメーション
4. **イベントループの自動投入ロジック**: Call Stack空時の挙動、Microtask優先処理の実装パターン
5. **Firebase Hosting設定**: SPAルーティング、環境変数（不要だが確認）

### 成果物

`research.md` - 各項目の調査結果、技術選定の根拠、実装パターンをまとめる

## Phase 1: Design & Contracts

### 成果物

1. **data-model.md**:
   - Taskエンティティの詳細設計
   - Areaの状態管理設計
   - LocalStorageのデータスキーマ

2. **contracts/** (型定義ファイル):
   - `task.types.ts`: Task型、TaskStatus型、TaskArea型
   - `area.types.ts`: AreaType型、AreaState型
   - `storage.types.ts`: StorageSchema型、StorageKey型

3. **quickstart.md**:
   - 開発環境のセットアップ手順
   - ローカル実行方法
   - ビルド＆デプロイ手順

### Agent Context Update

プロジェクトの技術スタック情報をagent contextファイルに追加:
- React 18.x + TypeScript
- Vite
- @dnd-kit
- Vitest + React Testing Library
- Firebase Hosting

## Implementation Notes

### イベントループロジックの実装方針

1. **状態管理**: `useReducer`でイベントループの状態を一元管理
   - Call Stackの現在のタスク（最大1つ）
   - Microtask Queueの配列
   - Task Queueの配列
   - Web APIの配列

2. **自動投入ロジック**: `useEffect`でCall Stackの状態を監視
   - Call Stackが空になったら、Microtask Queue → Task Queueの順で投入
   - Microtask Queueが複数ある場合、連続処理（アニメーション付き）

3. **LocalStorage同期**: カスタムフック`useLocalStorage`で自動保存
   - 状態変更時に自動的にLocalStorageに保存
   - マウント時にLocalStorageから復元

### UIデザイン方針

- **フォント**: Fira Code（コードリガチャ付き）をメインに、フォールバックでJetBrains Mono、Source Code Pro
- **カラーパレット**:
  - 背景: `#0a0a0a` (ほぼ黒)
  - メインテキスト: `#00ff00` (鮮やかな緑)
  - セカンダリ: `#00cc00` (少し暗い緑)
  - ボーダー: `#00ff0044` (半透明の緑)
  - エラー/警告: `#ff0000` (赤)

- **アニメーション**:
  - タスクの移動: スムーズなフェード＆スライド（250ms）
  - Call Stack投入: スケールアップアニメーション
  - 完了時: フェードアウト

- **レイアウト**:
  - 4つのエリアをグリッドレイアウトで配置
  - 各エリアはボーダー付きパネル（ターミナルウィンドウ風）
  - レスポンシブ対応（モバイルでは縦積み）

## Next Steps

1. `/speckit.plan`コマンドはここで終了し、Phase 0とPhase 1の成果物を生成
2. その後、`/speckit.tasks`コマンドで`tasks.md`を生成
3. 最終的に`/speckit.implement`コマンドで実装を開始

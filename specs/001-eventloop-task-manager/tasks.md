# Implementation Tasks: EventLoop4Human - イベントループ式タスク管理アプリ

**Branch**: `001-eventloop-task-manager` | **Date**: 2026-02-02
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 概要

このドキュメントは、EventLoop4Humanの実装タスクをユーザーストーリー別に整理したものです。各フェーズは独立してテスト可能な単位として設計されており、P1ストーリーのみでMVP（Minimum Viable Product）として価値を提供できます。

### タスク統計

- **総タスク数**: 62タスク
- **並列実行可能タスク**: 28タスク
- **ユーザーストーリー数**: 6ストーリー（P1: 2ストーリー、P2: 2ストーリー、P3: 2ストーリー）

### 推奨MVP範囲

**User Story 1（基本的なタスクフロー管理）** + **User Story 6（データの永続化）** のみでMVPとして十分な価値を提供できます。これにより、ユーザーはイベントループの基本動作を体験しながら、実用的なタスク管理が可能になります。

## 実装戦略

### インクリメンタルデリバリー

1. **Phase 1-2**: プロジェクトセットアップと基盤構築
2. **Phase 3-4**: P1ストーリー（US1 + US6）→ **MVP完成**
3. **Phase 5-6**: P2ストーリー（US2 + US3）→ イベントループの特徴的機能
4. **Phase 7-8**: P3ストーリー（US4 + US5）→ UX改善
5. **Phase 9**: 最終調整とポリッシュ

### 並列実行の機会

各フェーズ内で`[P]`マーカーが付いたタスクは並列実行可能です。異なるファイルに対する操作や、依存関係のないタスクが該当します。

---

## Phase 1: プロジェクトセットアップ

**目的**: Vite + React + TypeScriptプロジェクトの初期化と基本設定

### タスク一覧

- [X] T001 Viteプロジェクトを作成（`npm create vite@latest . -- --template react-ts`）
- [X] T002 [P] package.jsonに依存パッケージを追加（@dnd-kit/core, @dnd-kit/sortable, vitest, @testing-library/react, @testing-library/user-event）
- [X] T003 npm installで依存パッケージをインストール
- [X] T004 [P] tsconfig.jsonを更新（strict mode有効、パスエイリアス設定）
- [X] T005 [P] vite.config.tsを設定（Vitestプラグイン、パスエイリアス）
- [X] T006 [P] src/ディレクトリ構造を作成（components/, hooks/, types/, utils/, styles/）
- [X] T007 [P] tests/ディレクトリ構造を作成（unit/hooks/, unit/utils/, integration/）
- [X] T008 [P] .gitignoreを確認・更新（node_modules, dist, .env等）
- [X] T009 [P] index.htmlのタイトルとmetaタグを設定
- [X] T010 プロジェクトが正常に起動することを確認（`npm run dev`）

---

## Phase 2: 基盤コンポーネント構築

**目的**: すべてのユーザーストーリーで共通利用される型定義、ユーティリティ、スタイルを構築

### タスク一覧

- [X] T011 [P] specs/001-eventloop-task-manager/contracts/ から src/types/ に型定義ファイルをコピー（task.types.ts, area.types.ts, storage.types.ts, index.ts）
- [X] T012 [P] src/styles/theme.ts を作成（カラーパレット、フォント、アニメーション定義）
- [X] T013 [P] src/styles/globals.css を作成（ターミナル風ダークテーマ、リセットCSS）
- [X] T014 [P] Google Fontsから Fira Code フォントを読み込む設定を index.html に追加
- [X] T015 [P] src/utils/validation.ts を作成（Task型のバリデーション関数）
- [X] T016 [P] src/utils/taskFactory.ts を作成（createTask関数）
- [X] T017 基盤コンポーネントのビルドが通ることを確認（`npm run build`）

---

## Phase 3: User Story 1 - 基本的なタスクフロー管理 (P1)

**ストーリーゴール**: ユーザーは、Task Queueにタスクを追加し、Call Stackで1つずつタスクを実行し、完了させることができる。

**独立テスト基準**:
- Task Queueに新規タスクを追加できる
- Call Stackが空の時、Task Queueの先頭タスクが自動投入される
- Call Stack上のタスクを完了でき、次のタスクが自動投入される
- すべての状態変化がUI上で視覚的に確認できる

### タスク一覧

#### イベントループロジック

- [X] T018 [US1] src/hooks/useEventLoop.ts を作成（useReducer でイベントループ状態管理の骨組み）
- [X] T019 [US1] useEventLoop.ts に EventLoopAction型を定義（COMPLETE_TASK, ADD_TASK, AUTO_DISPATCH等）
- [X] T020 [US1] useEventLoop.ts に eventLoopReducer関数を実装（COMPLETE_TASKアクション処理）
- [X] T021 [US1] useEventLoop.ts に ADD_TASKアクションの処理を実装
- [X] T022 [US1] useEventLoop.ts に AUTO_DISPATCHアクションの処理を実装（Task Queue → Call Stack投入）
- [X] T023 [US1] useEventLoop.ts に useEffect で自動投入ロジックを実装（Call Stack空時のトリガー）

#### UIコンポーネント

- [X] T024 [P] [US1] src/components/task/TaskCard.tsx を作成（タスク表示カード、完了ボタン付き）
- [X] T025 [P] [US1] src/components/task/TaskForm.tsx を作成（新規タスク追加フォーム、投入先選択UI）
- [X] T026 [P] [US1] src/components/task/TaskList.tsx を作成（タスク一覧表示、空状態メッセージ）
- [X] T027 [P] [US1] src/components/areas/CallStack.tsx を作成（Call Stackエリア、最大1タスク表示、完了ボタン）
- [X] T028 [P] [US1] src/components/areas/TaskQueue.tsx を作成（Task Queueエリア、タスクリスト表示）
- [X] T029 [P] [US1] src/components/layout/MainLayout.tsx を作成（4エリアのグリッドレイアウト、レスポンシブ対応）

#### 統合と動作確認

- [X] T030 [US1] src/App.tsx を更新（useEventLoopフックを使用、MainLayoutを配置）
- [X] T031 [US1] src/main.tsx にグローバルスタイルをインポート
- [X] T032 [US1] 動作確認：Task Queueにタスクを追加 → Call Stackに自動投入 → 完了ボタンで次のタスクが投入

---

## Phase 4: User Story 6 - データの永続化 (P1)

**ストーリーゴール**: ブラウザを閉じても、すべてのタスクとその状態がLocalStorageに保存され、再度開いた時に復元される。

**独立テスト基準**:
- タスクを追加してブラウザをリロード → データが復元される
- Call Stack上のタスクがリロード後も保持される
- LocalStorageが無効の場合、適切なエラーメッセージが表示される

### タスク一覧

#### LocalStorage操作

- [X] T033 [P] [US6] src/utils/storage.ts を作成（saveToLocalStorage, loadFromLocalStorage関数）
- [X] T034 [P] [US6] src/utils/storage.ts にエラーハンドリングを実装（QuotaExceededError, SecurityError対応）
- [X] T035 [P] [US6] src/utils/storage.ts にマイグレーション関数を実装（バージョン管理）
- [X] T036 [US6] src/hooks/useLocalStorage.ts を作成（LocalStorage自動同期フック、debounce付き）

#### イベントループとの統合

- [X] T037 [US6] useEventLoop.ts を更新（useLocalStorageフックを統合）
- [X] T038 [US6] useEventLoop.ts に初回マウント時のデータ復元ロジックを追加
- [X] T039 [US6] useEventLoop.ts に状態変更時の自動保存ロジックを追加（debounce 300ms）

#### エラーハンドリングUI

- [X] T040 [P] [US6] src/components/layout/ErrorBoundary.tsx を作成（LocalStorageエラー表示）
- [X] T041 [US6] App.tsx にErrorBoundaryを配置

#### 動作確認

- [X] T042 [US6] 動作確認：タスク追加 → ブラウザリロード → データ復元を確認
- [X] T043 [US6] 動作確認：プライベートモードでアプリを開き、エラーメッセージが表示されることを確認

---

## Phase 5: User Story 2 - Microtask Queueによる優先タスク管理 (P2)

**ストーリーゴール**: ユーザーは、派生タスクをMicrotask Queueに追加し、Task Queueより優先的に処理できる。

**独立テスト基準**:
- Microtask Queueにタスクを追加できる
- Call Stack完了後、Microtask QueueがTask Queueより優先される
- Microtask Queueに複数タスクがある場合、すべて連続処理される

### タスク一覧

#### イベントループロジック拡張

- [X] T044 [US2] useEventLoop.ts の AUTO_DISPATCHアクションを更新（Microtask Queue優先ロジック追加）
- [X] T045 [US2] useEventLoop.ts の useEffect を更新（Microtask Queue連続処理ロジック、アニメーション遅延300ms）

#### UIコンポーネント

- [X] T046 [P] [US2] src/components/areas/MicrotaskQueue.tsx を作成（Microtask Queueエリア、優先表示）
- [X] T047 [US2] MainLayout.tsx を更新（Microtask Queueエリアを追加）
- [X] T048 [US2] TaskForm.tsx を更新（投入先選択に「Microtask Queue」を追加）

#### スタイル調整

- [X] T049 [P] [US2] Microtask Queueエリアに視覚的な優先度表示を追加（アクセントカラー: #00ffff）

#### 動作確認

- [X] T050 [US2] 動作確認：Task Queue と Microtask Queue に両方タスクを追加 → Microtask Queueが優先処理されることを確認

---

## Phase 6: User Story 3 - Web APIによるブロッキングタスク管理 (P2)

**ストーリーゴール**: Call Stack上のタスクをWeb APIエリアにブロックし、後でキューに戻せる。

**独立テスト基準**:
- Call Stackのタスクを「ブロック」ボタンでWeb APIに移動できる
- Web APIのタスクをTask QueueまたはMicrotask Queueに戻せる
- ブロック時に次のタスクが自動投入される

### タスク一覧

#### イベントループロジック拡張

- [X] T051 [US3] useEventLoop.ts に BLOCK_TASKアクションを追加（Call Stack → Web API移動）
- [X] T052 [US3] useEventLoop.ts に MOVE_TASKアクションを追加（Web API → 任意のキュー移動）

#### UIコンポーネント

- [X] T053 [P] [US3] src/components/areas/WebAPI.tsx を作成（Web APIエリア、タスクリスト表示）
- [X] T054 [US3] CallStack.tsx を更新（「ブロック → Web APIへ」ボタン追加）
- [X] T055 [US3] WebAPI.tsx にタスクごとの移動先選択UI追加（Task QueueまたはMicrotask Queueへ）
- [X] T056 [US3] MainLayout.tsx を更新（Web APIエリアを追加）

#### 動作確認

- [X] T057 [US3] 動作確認：Call Stackのタスクをブロック → Web APIに移動 → キューに戻す → 処理される

---

## Phase 7: User Story 4 - キュー内タスクの並べ替え (P3)

**ストーリーゴール**: Microtask QueueとTask Queue内のタスクをドラッグ&ドロップで並べ替えできる。

**独立テスト基準**:
- Task Queue内でタスクをドラッグ&ドロップで並べ替えできる
- Microtask Queue内でタスクをドラッグ&ドロップで並べ替えできる
- 並べ替え後、Call Stack投入順序が変更される

### タスク一覧

#### ドラッグ&ドロップ実装

- [X] T058 [US4] useEventLoop.ts に REORDER_QUEUEアクションを追加（キュー内並べ替え）
- [X] T059 [P] [US4] TaskQueue.tsx を更新（@dnd-kitのDndContext、SortableContextを統合）
- [X] T060 [P] [US4] MicrotaskQueue.tsx を更新（@dnd-kitのDndContext、SortableContextを統合）
- [X] T061 [US4] TaskCard.tsx を更新（useSortable フックを適用、ドラッグハンドル追加）

#### 動作確認

- [X] T062 [US4] 動作確認：Task Queue内でタスクをドラッグ&ドロップ → 順序変更 → Call Stack投入順序が変わることを確認

---

## Phase 8: User Story 5 - タスク属性の管理 (P3)

**ストーリーゴール**: タスクに見積もり時間、カテゴリ、メモを設定・編集できる。

**独立テスト基準**:
- 新規タスク作成時にすべての属性を入力できる
- 既存タスクをクリックして編集できる
- 属性がタスクカードに表示される

### タスク一覧

#### タスクフォーム拡張

- [ ] T063 [P] [US5] TaskForm.tsx を更新（見積もり時間、カテゴリ、メモ入力フィールド追加）
- [ ] T064 [P] [US5] TaskForm.tsx にバリデーション表示を追加（エラーメッセージ表示）

#### タスク編集機能

- [ ] T065 [US5] useEventLoop.ts に UPDATE_TASKアクションを追加
- [ ] T066 [P] [US5] src/components/task/TaskEditModal.tsx を作成（タスク編集モーダル）
- [ ] T067 [US5] TaskCard.tsx を更新（クリックで編集モーダルを開く）

#### 属性表示

- [ ] T068 [P] [US5] TaskCard.tsx を更新（見積もり時間、カテゴリ、メモの表示）

#### 動作確認

- [ ] T069 [US5] 動作確認：タスク作成時に属性入力 → 保存 → タスクカードに表示されることを確認
- [ ] T070 [US5] 動作確認：タスククリック → 編集モーダル → 属性変更 → 即座に反映されることを確認

---

## Phase 9: ポリッシュと最終調整

**目的**: アニメーション、レスポンシブ対応、エッジケース対応、ビルド最適化

### タスク一覧

#### アニメーション追加

- [ ] T071 [P] TaskCard.tsx にタスク移動アニメーションを追加（フェード＆スライド 250ms）
- [ ] T072 [P] CallStack.tsx にCall Stack投入アニメーションを追加（スケールイン 250ms）
- [ ] T073 [P] TaskCard.tsx にタスク完了アニメーションを追加（フェードアウト 400ms）

#### レスポンシブ対応

- [ ] T074 [P] MainLayout.tsx のCSSをモバイル対応に調整（768px以下で縦積みレイアウト）
- [ ] T075 [P] TaskForm.tsx をモバイル画面サイズに最適化

#### エッジケース対応

- [ ] T076 [P] すべてのエリアが空の時の空状態UIを追加（各エリアコンポーネント）
- [ ] T077 [P] LocalStorage容量警告を実装（80%超過時に警告表示）
- [ ] T078 [P] Microtask Queue連続処理の一時停止UI追加（5タスクごとに「続行」ボタン表示、オプション機能）

#### Firebase Hosting設定

- [ ] T079 [P] firebase.json を作成（hosting設定、SPAリライトルール）
- [ ] T080 [P] .firebaserc を作成（プロジェクトID設定）

#### 最終ビルドと動作確認

- [ ] T081 プロダクションビルド（`npm run build`）
- [ ] T082 ビルド成果物のプレビュー（`npm run preview`）
- [ ] T083 すべてのユーザーストーリーの受け入れシナリオを手動テスト
- [ ] T084 Firebase Hostingへデプロイ（`firebase deploy`）

---

## 依存関係グラフ（ユーザーストーリー完了順序）

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
    ├─→ Phase 3 (US1: 基本タスクフロー) ──┐
    │                                      ↓
    └─→ Phase 4 (US6: データ永続化) ────→ MVP完成
                                           ↓
    ┌──────────────────────────────────────┘
    ├─→ Phase 5 (US2: Microtask Queue) ─┐
    │                                    ↓
    └─→ Phase 6 (US3: Web API) ─────────┤
                                         ↓
    ┌────────────────────────────────────┘
    ├─→ Phase 7 (US4: ドラッグ&ドロップ) ─┐
    │                                      ↓
    └─→ Phase 8 (US5: タスク属性) ────────┤
                                           ↓
                                    Phase 9 (Polish)
```

### ストーリー間の依存関係

- **US1** と **US6** は相互依存（US1がデータを生成、US6が永続化）→ 両方完成でMVP
- **US2** と **US3** はUS1に依存、相互には独立（並行実装可能）
- **US4** と **US5** はUS1に依存、相互には独立（並行実装可能）
- **US2** のMicrotask Queue は **US3** のWeb APIと独立
- **US4** のドラッグ&ドロップ は **US5** のタスク属性編集と独立

---

## 並列実行の例

### Phase 2 での並列実行

```bash
# 同時に実行可能（異なるファイル）
T011: 型定義ファイルのコピー
T012: theme.ts の作成
T013: globals.css の作成
T014: フォント読み込み設定
T015: validation.ts の作成
T016: taskFactory.ts の作成
```

### Phase 3 での並列実行

```bash
# UIコンポーネントは並列実装可能
T024: TaskCard.tsx
T025: TaskForm.tsx
T026: TaskList.tsx
T027: CallStack.tsx
T028: TaskQueue.tsx
T029: MainLayout.tsx
```

---

## フォーマット検証

✅ すべてのタスクはチェックリスト形式（`- [ ]`）で記述
✅ すべてのタスクにTask ID（T001-T084）を付与
✅ 並列実行可能なタスクに`[P]`マーカーを付与
✅ ユーザーストーリーフェーズのタスクに`[US1]`-`[US6]`ラベルを付与
✅ すべてのタスクに明確なファイルパスまたは操作内容を記述

---

## 次のステップ

このtasks.mdが完成したら、`/speckit.implement`コマンドでタスクの実装を開始できます。推奨は**Phase 1から順番に実装**し、**Phase 4完了時点でMVPをデプロイ**することです。

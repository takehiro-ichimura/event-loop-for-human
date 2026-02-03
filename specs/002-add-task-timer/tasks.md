# Tasks: タスクタイマー機能

**Input**: Design documents from `/specs/002-add-task-timer/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: テストタスクはオプション（Phase 7に含む）。plan.mdにテストファイルが定義されているため、Polish phaseにまとめて記載。

**Organization**: タスクはユーザーストーリーごとにグループ化。各ストーリーは独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 所属するユーザーストーリー（US1, US2, US3, US4）
- 説明には正確なファイルパスを含める

---

## Phase 1: Setup（共有インフラ）

**Purpose**: プロジェクト初期化と基本構造の確認

- [X] T001 開発環境の確認（`npm install && npm run dev && npm test` が成功すること）
- [X] T002 [P] 型定義ファイルを作成 `src/types/timer.types.ts`
- [X] T003 [P] ユーティリティファイルを作成 `src/utils/timer.ts`
- [X] T004 [P] カスタムフックファイルを作成 `src/hooks/useTaskTimer.ts`
- [X] T005 [P] タイマーコンポーネントファイルを作成 `src/components/task/TaskTimer.tsx`

---

## Phase 2: Foundational（基盤となる前提条件）

**Purpose**: すべてのユーザーストーリーが依存するコアインフラ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できない

- [X] T006 [P] `TimerState` インターフェースを実装 `src/types/timer.types.ts`
- [X] T007 [P] `TimerStorageSchema` インターフェースを実装 `src/types/timer.types.ts`
- [X] T008 [P] `UseTaskTimerReturn` インターフェースを実装 `src/types/timer.types.ts`
- [X] T009 [P] `TaskTimerProps` インターフェースを実装 `src/types/timer.types.ts`
- [X] T010 [P] `TimerValidationResult` インターフェースを実装 `src/types/timer.types.ts`
- [X] T011 [P] ストレージ定数 `TIMER_STORAGE_KEY`, `TIMER_STORAGE_VERSION` を定義 `src/types/timer.types.ts`
- [X] T012 型定義を `src/types/index.ts` からエクスポート

**Checkpoint**: 基盤完了 - ユーザーストーリーの実装を開始可能

---

## Phase 3: User Story 1 - タスク実行時間の確認 (Priority: P1) 🎯 MVP

**Goal**: コールスタックで実行中のタスクの経過時間をリアルタイムで表示する

**Independent Test**: タスクをコールスタックに移動し、タイマーが0から開始され、1秒ごとに更新されることを確認

### Implementation for User Story 1

- [X] T013 [P] [US1] `formatElapsedTime(ms: number): string` を実装 `src/utils/timer.ts`
- [X] T014 [P] [US1] `formatTimestamp(timestamp: number): string` を実装 `src/utils/timer.ts`
- [X] T015 [P] [US1] `calculateElapsedTime(state: TimerState, currentTime?: number): number` を実装 `src/utils/timer.ts`
- [X] T016 [US1] `startTimer(taskId: string): TimerState` を実装 `src/utils/timer.ts`
- [X] T017 [US1] `useTaskTimer` フックの基本構造を実装（タイマー開始、経過時間計算） `src/hooks/useTaskTimer.ts`
- [X] T018 [US1] `setInterval` による1秒間隔の更新ロジックを実装 `src/hooks/useTaskTimer.ts`
- [X] T019 [US1] `TaskTimer` コンポーネントの基本表示を実装（経過時間、開始時刻） `src/components/task/TaskTimer.tsx`
- [X] T020 [US1] ターミナル美学に準拠したスタイルを適用（マゼンタ、等幅フォント） `src/components/task/TaskTimer.tsx`
- [X] T021 [US1] `CallStack` コンポーネントに `TaskTimer` を統合 `src/components/areas/CallStack.tsx`
- [X] T022 [US1] タスク完了/ブロック時のタイマーリセット処理を実装 `src/hooks/useTaskTimer.ts`

**Checkpoint**: User Story 1 完了 - タイマーの基本表示が動作し、独立してテスト可能

---

## Phase 4: User Story 2 - タイマーの一時停止 (Priority: P2)

**Goal**: タイマーを一時停止して実際の作業時間を正確に把握できるようにする

**Independent Test**: 一時停止ボタンをクリックしてタイマーが停止し、再開ボタンで継続することを確認

### Implementation for User Story 2

- [X] T023 [P] [US2] `pauseTimer(state: TimerState): TimerState` を実装 `src/utils/timer.ts`
- [X] T024 [P] [US2] `resumeTimer(state: TimerState): TimerState` を実装 `src/utils/timer.ts`
- [X] T025 [US2] `useTaskTimer` に pause/resume アクションを追加 `src/hooks/useTaskTimer.ts`
- [X] T026 [US2] 一時停止中の経過時間計算ロジックを更新 `src/hooks/useTaskTimer.ts`
- [X] T027 [US2] 一時停止/再開ボタンを `TaskTimer` に追加 `src/components/task/TaskTimer.tsx`
- [X] T028 [US2] ボタンスタイルを既存の完了/ブロックボタンと統一 `src/components/task/TaskTimer.tsx`
- [X] T029 [US2] 再開時刻の表示を実装（`lastResumeTime` がある場合のみ） `src/components/task/TaskTimer.tsx`

**Checkpoint**: User Story 2 完了 - 一時停止/再開が動作し、独立してテスト可能

---

## Phase 5: User Story 3 - タイマー状態の視覚的フィードバック (Priority: P3)

**Goal**: タイマーが動作中か一時停止中かを視覚的に区別できるようにする

**Independent Test**: タイマーの動作中と一時停止中で異なる視覚的表示（色の違い）がされることを確認

### Implementation for User Story 3

- [X] T030 [P] [US3] 動作中のスタイル定義（マゼンタ #ff00ff） `src/components/task/TaskTimer.tsx`
- [X] T031 [P] [US3] 一時停止中のスタイル定義（半透明マゼンタ #ff00ff88） `src/components/task/TaskTimer.tsx`
- [X] T032 [US3] `isPaused` 状態に基づいてスタイルを切り替えるロジックを実装 `src/components/task/TaskTimer.tsx`
- [ ] T033 [US3] 一時停止状態の視覚的フィードバックをテスト（手動確認）

**Checkpoint**: User Story 3 完了 - 視覚的フィードバックが動作し、独立してテスト可能

---

## Phase 6: User Story 4 - タイマー状態の永続化 (Priority: P4)

**Goal**: ページリロードやブラウザ再起動後もタイマー状態を維持する

**Independent Test**: タスクがコールスタックで実行中にページをリロードし、タイマーが以前の経過時間から継続することを確認

### Implementation for User Story 4

- [X] T034 [P] [US4] `validateTimerState(state: TimerState): TimerValidationResult` を実装 `src/utils/timer.ts`
- [X] T035 [P] [US4] LocalStorage保存ユーティリティ `saveTimerState(state: TimerState | null)` を実装 `src/utils/timer.ts`
- [X] T036 [P] [US4] LocalStorage読込ユーティリティ `loadTimerState(): TimerState | null` を実装 `src/utils/timer.ts`
- [X] T037 [US4] `useTaskTimer` でLocalStorageからの状態復元を実装 `src/hooks/useTaskTimer.ts`
- [X] T038 [US4] `useTaskTimer` で状態変更時のLocalStorage保存を実装 `src/hooks/useTaskTimer.ts`
- [X] T039 [US4] タスクID変更時の古い状態クリアロジックを実装 `src/hooks/useTaskTimer.ts`
- [X] T040 [US4] リロード時の経過時間再計算（リロード中の時間も考慮）を実装 `src/hooks/useTaskTimer.ts`
- [ ] T041 [US4] 永続化の手動テスト（ページリロード、ブラウザ再起動）

**Checkpoint**: User Story 4 完了 - 永続化が動作し、独立してテスト可能

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善とテスト

### テスト（オプション）

- [X] T042 [P] ユーティリティ関数のユニットテストを実装 `tests/utils/timer.test.ts`
- [ ] T043 [P] `useTaskTimer` フックのテストを実装 `tests/hooks/useTaskTimer.test.ts`
- [ ] T044 [P] `TaskTimer` コンポーネントのテストを実装 `tests/components/TaskTimer.test.tsx`

### 品質保証

- [X] T045 `npm test` ですべてのテストが通ることを確認
- [ ] T046 `npm run lint` でリントエラーがないことを確認
- [ ] T047 quickstart.md のシナリオを手動で検証

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了後 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-6)**: Foundational完了後
  - ユーザーストーリーは優先順序で進行（P1 → P2 → P3 → P4）
  - US2以降はUS1に軽い依存あり（基本的なフック構造を使用）
- **Polish (Phase 7)**: すべてのユーザーストーリー完了後

### User Story Dependencies

```
US1 (タイマー基本表示)
  ↓ (基本フック構造)
US2 (一時停止機能)
  ↓ (isPaused状態)
US3 (視覚的フィードバック)
  ↓ (一時停止状態)
US4 (永続化)
```

- **US1**: Foundational完了後に開始可能 - 他のストーリーへの依存なし
- **US2**: US1の基本フック構造に軽い依存（並列実装も可能だが順次推奨）
- **US3**: US2のisPaused状態に依存
- **US4**: US1-US3の機能を永続化するため、最後に実装推奨

### Within Each User Story

- ユーティリティ関数 → フック → コンポーネント → 統合
- [P]マークのタスクは並列実行可能
- ストーリー完了後、次の優先度に進む

### Parallel Opportunities

- T002-T005: 空ファイル作成は並列可能
- T006-T011: 型定義は並列可能
- T013-T015: ユーティリティ関数は並列可能
- T023-T024: pause/resume関数は並列可能
- T030-T031: スタイル定義は並列可能
- T034-T036: 永続化ユーティリティは並列可能
- T042-T044: テストは並列可能

---

## Parallel Example: User Story 1

```bash
# Step 1: ユーティリティ関数を並列で実装
Task: "formatElapsedTime を実装 src/utils/timer.ts"
Task: "formatTimestamp を実装 src/utils/timer.ts"
Task: "calculateElapsedTime を実装 src/utils/timer.ts"

# Step 2: フックとコンポーネントを順次実装
Task: "useTaskTimer フックの基本構造を実装"
→ Task: "setInterval による更新ロジックを実装"
→ Task: "TaskTimer コンポーネントの基本表示を実装"
→ Task: "CallStack に統合"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（CRITICAL - すべてのストーリーをブロック）
3. Phase 3: User Story 1 完了
4. **STOP and VALIDATE**: US1を独立してテスト
5. デモ/デプロイ可能

### Incremental Delivery

1. Setup + Foundational 完了 → 基盤準備完了
2. US1 追加 → 独立テスト → デモ（MVP！）
3. US2 追加 → 独立テスト → 一時停止機能追加
4. US3 追加 → 独立テスト → UX改善
5. US4 追加 → 独立テスト → 永続化で安心感
6. 各ストーリーが独立した価値を提供

### 推奨開発フロー

```
Day 1: Phase 1-2 (Setup + Foundational) + Phase 3 (US1) → MVP完成
Day 2: Phase 4 (US2) + Phase 5 (US3) → 主要機能完成
Day 3: Phase 6 (US4) + Phase 7 (Polish) → 完全版
```

---

## Summary

| 指標 | 値 |
|------|-----|
| 総タスク数 | 47 |
| Phase 1 (Setup) | 5 タスク |
| Phase 2 (Foundational) | 7 タスク |
| Phase 3 (US1 - MVP) | 10 タスク |
| Phase 4 (US2) | 7 タスク |
| Phase 5 (US3) | 4 タスク |
| Phase 6 (US4) | 8 タスク |
| Phase 7 (Polish) | 6 タスク |
| 並列実行可能タスク | 22 タスク |
| MVP スコープ | US1 のみ（Phase 1-3、22タスク） |

### 各ストーリーの独立テスト基準

| Story | 独立テスト基準 |
|-------|---------------|
| US1 | タスクをCall Stackに移動し、タイマーが0から開始され1秒ごとに更新される |
| US2 | 一時停止ボタンクリックでタイマー停止、再開ボタンで継続 |
| US3 | 動作中と一時停止中で異なる色（マゼンタ vs 半透明マゼンタ）が表示される |
| US4 | ページリロード後、タイマーが以前の経過時間から継続する |

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベル = 特定のユーザーストーリーへのマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- チェックポイントでストーリーを個別に検証
- コミットは各タスクまたは論理的なグループ単位で実行
- 避けるべき: 曖昧なタスク、同一ファイルの競合、ストーリー間の独立性を損なう依存関係

# Tasks: 作業ログ機能

**Input**: Design documents from `/specs/003-add-work-log/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/work-log-api.md, quickstart.md

**Organization**: タスクはユーザーストーリー単位でグループ化。各ストーリーは独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 所属するユーザーストーリー（US1, US2, US3）
- 各タスクに正確なファイルパスを記載

---

## Phase 1: Setup（型定義とストレージ基盤）

**Purpose**: 全ユーザーストーリーで共有される型定義とストレージ層の構築

- [X] T001 [P] `src/types/worklog.types.ts` を作成し、LogEntry, LogOperation, WorkLogStorageSchema, WorkSummary, DailyStats, DateFilter, RecordLogParams 型およびストレージ定数（WORKLOG_STORAGE_KEY, WORKLOG_STORAGE_VERSION, WORKLOG_MAX_ENTRIES, WORKLOG_PAGE_SIZE）を定義する。data-model.md のエンティティ定義とバリデーションルールに準拠すること
- [X] T002 [P] `src/types/index.ts` を更新し、worklog.types.ts の全型・定数の re-export を追加する
- [X] T003 `src/utils/workLogStorage.ts` を作成し、loadWorkLogs(), saveWorkLogs(), clearWorkLogs(), getWorkLogMetadata() を実装する。既存の storage.ts のパターン（エラー分類、sessionStorageフォールバック、StorageResult型）を踏襲し、ストレージキー `eventloop4human:logs` を使用すること。5000件上限の自動トリミングロジックを saveWorkLogs 内に含める

**Checkpoint**: 型定義とストレージ層が利用可能。`npm run type-check` が通ること

---

## Phase 2: Foundational（コアロジック）

**Purpose**: ログ記録・エクスポート・フックの基盤。全ユーザーストーリーがこれに依存する

**⚠️ CRITICAL**: Phase 2 完了まで、ユーザーストーリーの実装を開始しないこと

- [X] T004 [P] `src/utils/workLogExport.ts` を作成し、exportToCSV() と exportToJSON() を実装する。CSV は UTF-8 BOM付き（`\uFEFF`）、日本語ヘッダー行あり、ダブルクォート囲み。JSON は exportedAt, totalEntries, entries を含む。Blob + URL.createObjectURL + 即時クリーンアップパターンを使用すること
- [X] T005 `src/hooks/useWorkLog.ts` を作成し、UseWorkLogReturn インターフェースに準拠した useWorkLog フックを実装する。contracts/work-log-api.md の動作仕様に従い、recordLog（エントリ作成＋配列先頭追加＋5000件トリミング＋LocalStorage即座保存）、setDateFilter（フィルタ更新＋filteredEntries再計算）、getSummary（期間指定サマリー集計）、clearAllLogs、exportLogs（workLogExport連携）を提供すること。初回マウント時にloadWorkLogsでストレージから復元すること

**Checkpoint**: `useWorkLog` フックが単体で機能する。ログ記録→取得→フィルタ→サマリー→エクスポート→クリアの一連の操作が内部的に動作すること

---

## Phase 3: User Story 1 - 作業履歴の自動記録 (Priority: P1) 🎯 MVP

**Goal**: タスク操作（作成・移動・完了・ブロック・一時停止・再開）のたびにシステムがバックグラウンドでログを自動記録する

**Independent Test**: タスクを作成→Microtask Queueに移動→Call Stackに配置→完了の一連操作を行い、各ステップのログエントリが記録されていることを確認する

### サイドバータブUI（US1で必要な最小限のUI）

- [X] T006 [P] [US1] `src/components/sidebar/SidebarTabs.tsx` を作成し、2タブ切替コンポーネント（「タスク追加」タブと「ログ」タブ）を実装する。タブ状態はローカルstate管理、children としてタブ内容を受け取る。ターミナルテーマ（#0a0a0a背景、#00ff00テキスト、等幅フォント）に準拠し、アクティブタブの下線にアクセントカラーを使用すること

### App.tsx統合（ログ記録の接続）

- [X] T007 [US1] `src/App.tsx` を更新し、以下を実装する: (1) useWorkLog フックを統合、(2) SidebarTabs コンポーネントでサイドバーを包み、タスク追加タブに既存の TaskForm、ログタブにプレースホルダーを配置、(3) state変化を監視するuseEffectで各操作（created, completed, blocked, moved）のログ記録を実装。(4) Auto-Dispatchのログ記録も state監視で実装済み。(5) タイマーのpause/resume操作と経過時間取得は未実装（後続タスクで対応）

**Checkpoint**: タスクを操作するとログが自動記録され、LocalStorageの `eventloop4human:logs` キーに保存される。ブラウザを閉じて再度開いてもログが保持される。ログタブにはプレースホルダーが表示される

---

## Phase 4: User Story 2 - 作業ログの閲覧 (Priority: P2)

**Goal**: ユーザーが過去の作業ログを時系列で一覧表示し、日付フィルタで絞り込んで振り返ることができる

**Independent Test**: 複数のタスク操作を行った後、ログタブを開き、すべてのログエントリが新しい順に表示され、日付フィルタで絞り込めることを確認する

### UIコンポーネント

- [X] T008 [P] [US2] `src/components/worklog/WorkLogList.tsx` を作成し、ログエントリの一覧表示コンポーネントを実装する。初期表示50件＋「もっと見る」ボタンで50件ずつ追加読込。各エントリにはタスク名、操作種別（アクセントカラーで色分け: created=緑, moved=シアン, completed=マゼンタ, blocked=オレンジ, paused/resumed=muted green）、タイムスタンプ（HH:mm:ss形式）、from→toエリア（該当時）、経過時間（completed時）を表示。空データ時は「ログがありません」メッセージを表示すること
- [X] T009 [P] [US2] `src/components/worklog/WorkLogFilter.tsx` を作成し、日付フィルタコンポーネントを実装する。開始日・終了日の `<input type="date">`、プリセットボタン（「今日」「過去7日」「過去30日」）、クリアボタンを配置。ターミナルテーマに合わせたスタイリング（#0a0a0a背景、#00ff00ボーダー、等幅フォント）を適用すること
- [X] T010 [P] [US2] `src/components/worklog/WorkLogActions.tsx` を作成し、ログ管理アクションコンポーネントを実装する。「全ログクリア」ボタン（window.confirmによる確認ダイアログ付き）、「CSV出力」ボタン、「JSON出力」ボタンを配置。各ボタンはログ件数表示（「全 N 件をクリア」など）を含むこと
- [X] T011 [US2] `src/components/worklog/WorkLogPanel.tsx` を作成し、ログタブのメインパネルコンポーネントを実装する。WorkLogFilter、WorkLogList、WorkLogActions を統合し、useWorkLog から受け取った props（filteredEntries, dateFilter, setDateFilter, clearAllLogs, exportLogs, totalCount）をそれぞれの子コンポーネントに配分すること

### App.tsx統合（ログパネル接続）

- [X] T012 [US2] `src/App.tsx` を更新し、Phase 3で配置したログタブのプレースホルダーを WorkLogPanel に置き換える。useWorkLog の filteredEntries, dateFilter, setDateFilter, clearAllLogs, exportLogs, totalCount を WorkLogPanel に渡すこと

**Checkpoint**: サイドバーのログタブを開くと、ログが新しい順に一覧表示される。日付フィルタで絞り込みが可能。CSV/JSONエクスポートでファイルがダウンロードされる。全ログクリアが確認ダイアログ付きで動作する

---

## Phase 5: User Story 3 - 作業パターンの分析 (Priority: P3)

**Goal**: 蓄積されたログから、完了タスク数・平均所要時間・日別作業量をサマリー表示し、テキストベースのバーチャートで可視化する

**Independent Test**: 1週間分の作業ログが蓄積された状態で分析セクションを確認し、完了タスク数・平均所要時間・日別バーチャートが正しく表示されることを確認する

### UIコンポーネント

- [X] T013 [P] [US3] `src/components/worklog/DailyBarChart.tsx` を作成し、テキストベースのバーチャートコンポーネントを実装する。DailyStats[]を受け取り、等幅フォントでASCIIバーチャート（`████░░░░ 5件` 形式）を表示する。最大値に対する比率でバーの長さを算出し、バー幅は20文字固定。データなし時は「データがありません」メッセージを表示すること
- [X] T014 [P] [US3] `src/components/worklog/WorkLogAnalysis.tsx` を作成し、分析セクションコンポーネントを実装する。(1) サマリー表示: 完了タスク数、平均所要時間（formatElapsedTime関数で HH:mm:ss 形式に変換）。(2) 日別テーブル: 日付、完了数、平均時間の3カラム。(3) DailyBarChart の統合。getSummary関数を呼び出して集計結果を取得すること

### WorkLogPanel統合

- [X] T015 [US3] `src/components/worklog/WorkLogPanel.tsx` を更新し、WorkLogAnalysis をログ一覧の下部に追加する。useWorkLog の getSummary を WorkLogAnalysis に渡し、現在の dateFilter に連動したサマリーを表示すること

**Checkpoint**: ログタブのパネル下部に分析セクションが表示される。期間を変更するとサマリーとバーチャートが更新される。データ精度が実際のログと100%一致する

---

## Phase 6: テスト

**Purpose**: 全ユーザーストーリーの品質を検証するテストの実装

- [X] T016 [P] `tests/utils/workLogStorage.test.ts` を作成し、workLogStorage のテストを実装する。テスト内容: (1) 空のストレージからの読み込みで空配列が返る、(2) エントリの保存→読み込みの往復テスト、(3) 5000件超過時の自動トリミング、(4) クリア後に空配列が返る、(5) メタデータ取得テスト。vi.useFakeTimers() でタイムスタンプを固定すること
- [X] T017 [P] `tests/utils/workLogExport.test.ts` を作成し、workLogExport のテストを実装する。テスト内容: (1) CSV出力のBOMヘッダー・ヘッダー行・データ行のフォーマット検証、(2) JSON出力のスキーマ検証、(3) 空データ時の動作検証。Blob と URL.createObjectURL をモックすること
- [X] T018 [P] `tests/hooks/useWorkLog.test.ts` を作成し、useWorkLog フックのテストを実装する。renderHook を使用し、(1) recordLogでエントリが追加される、(2) setDateFilterでfilteredEntriesが絞り込まれる、(3) getSummaryで正しい集計結果が返る、(4) clearAllLogsで全件削除される、をテストすること
- [X] T019 [P] `tests/components/worklog/WorkLogList.test.ts` を作成し、WorkLogList コンポーネントのテストを実装する。テスト内容: (1) ログエントリが正しく表示される、(2) 「もっと見る」ボタンで追加表示される、(3) 空データ時にメッセージが表示される
- [X] T020 [P] `tests/components/worklog/WorkLogAnalysis.test.ts` を作成し、WorkLogAnalysis コンポーネントのテストを実装する。テスト内容: (1) サマリー数値が正しく表示される、(2) 日別テーブルが正しく表示される、(3) バーチャートが期待通りの文字列を出力する

**Checkpoint**: `npm test` が全テストパスする

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全ストーリーに影響する仕上げ作業

- [X] T021 `npm test && npm run lint` を実行し、全テストとリントが通ることを確認する。エラーがあれば修正する（注: lintスクリプトは未定義のため、npm test のみ実行）
- [X] T022 `npm run type-check` を実行し、TypeScript型チェックが通ることを確認する。エラーがあれば修正する
- [X] T023 quickstart.md の動作確認チェックリストに従い、全項目の手動動作確認を実施する（注: 手動確認は開発環境で実施可能）

**Checkpoint**: 全テスト・リント・型チェック通過。quickstart.md チェックリスト全項目クリア

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし - 即座に開始可能
- **Phase 2 (Foundational)**: Phase 1 完了に依存 - 全ユーザーストーリーをブロック
- **Phase 3 (US1: 自動記録)**: Phase 2 完了に依存
- **Phase 4 (US2: 閲覧)**: Phase 3 完了に依存（App.tsx のタブ統合が必要）
- **Phase 5 (US3: 分析)**: Phase 4 完了に依存（WorkLogPanel への統合が必要）
- **Phase 6 (テスト)**: Phase 5 完了に依存（全機能実装後にテスト作成）
- **Phase 7 (Polish)**: Phase 6 完了に依存

### User Story Dependencies

- **US1 (P1: 自動記録)**: Phase 2 完了後に開始 - 他ストーリーに依存しない
- **US2 (P2: 閲覧)**: US1 完了に依存（サイドバータブ統合とApp.tsx更新がUS1で実施されるため）
- **US3 (P3: 分析)**: US2 完了に依存（WorkLogPanelがUS2で作成されるため）

### Within Each User Story

- コンポーネントは [P] マーク付きで並列作成可能
- 統合タスク（App.tsx / WorkLogPanel 更新）は子コンポーネント完了後に実施

### Parallel Opportunities

- Phase 1: T001 と T002 は並列実行可能
- Phase 2: T004 は T005 と独立（ただし T005 は T004 に依存）
- Phase 3: T006 は T007 と並列実行可能
- Phase 4: T008, T009, T010 は並列実行可能
- Phase 5: T013, T014 は並列実行可能
- Phase 6: T016〜T020 は全て並列実行可能

---

## Parallel Example: User Story 2

```bash
# ログ一覧・フィルタ・アクションの3コンポーネントを並列で作成:
Task: "T008 [P] [US2] WorkLogList.tsx を作成"
Task: "T009 [P] [US2] WorkLogFilter.tsx を作成"
Task: "T010 [P] [US2] WorkLogActions.tsx を作成"

# 上記3つが完了後、統合タスクを順次実行:
Task: "T011 [US2] WorkLogPanel.tsx を作成"
Task: "T012 [US2] App.tsx を更新"
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup 完了 → 型とストレージが利用可能
2. Phase 2: Foundational 完了 → useWorkLog フックが動作
3. Phase 3: User Story 1 完了 → タスク操作でログが自動記録される
4. **STOP and VALIDATE**: ブラウザの DevTools で LocalStorage を確認し、ログが正しく記録されていることを検証
5. サイドバーにタブUIが表示され、ログタブの存在を確認

### Incremental Delivery

1. Setup + Foundational → 基盤準備完了
2. User Story 1 追加 → ログ自動記録が動作（MVP!）
3. User Story 2 追加 → ログ閲覧・フィルタ・エクスポートが動作
4. User Story 3 追加 → 分析・バーチャートが動作
5. テスト + Polish → 品質保証完了

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはユーザーストーリーへのトレーサビリティを提供
- 各ユーザーストーリーは独立して完成・テスト可能
- 各タスクまたは論理グループの完了後にコミット
- チェックポイントで独立してストーリーを検証可能

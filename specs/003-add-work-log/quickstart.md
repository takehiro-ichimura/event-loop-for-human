# クイックスタートガイド: 作業ログ機能

**Feature**: 003-add-work-log | **Date**: 2026-02-14

## 開発環境セットアップ

```bash
# リポジトリのクローン＆ブランチ切替
git checkout 003-add-work-log

# 依存関係のインストール（新しいライブラリの追加なし）
npm install

# 開発サーバー起動
npm run dev
```

## 実装順序

### Step 1: 型定義とストレージ層（基盤）

1. `src/types/worklog.types.ts` を作成
   - `LogEntry`, `LogOperation`, `WorkLogStorageSchema`, `WorkSummary`, `DailyStats`, `DateFilter` 型を定義
   - ストレージ定数（`WORKLOG_STORAGE_KEY`, `WORKLOG_MAX_ENTRIES` 等）を定義

2. `src/types/index.ts` を更新
   - worklog型のre-exportを追加

3. `src/utils/workLogStorage.ts` を作成
   - `loadWorkLogs()`, `saveWorkLogs()`, `clearWorkLogs()`, `getWorkLogMetadata()` を実装
   - 既存の `storage.ts` のパターン（エラー分類、フォールバック）を踏襲

### Step 2: コアロジック（フック＋エクスポート）

4. `src/utils/workLogExport.ts` を作成
   - `exportToCSV()`, `exportToJSON()` を実装

5. `src/hooks/useWorkLog.ts` を作成
   - ログ記録（`recordLog`）、フィルタリング、サマリー集計、クリア、エクスポート連携

### Step 3: UIコンポーネント

6. `src/components/worklog/WorkLogList.tsx` を作成
   - ログ一覧表示（「もっと見る」パターン）

7. `src/components/worklog/WorkLogFilter.tsx` を作成
   - 日付フィルタ（`<input type="date">` + プリセットボタン）

8. `src/components/worklog/DailyBarChart.tsx` を作成
   - テキストベースのバーチャート（ASCII `████░░░░`）

9. `src/components/worklog/WorkLogAnalysis.tsx` を作成
   - サマリー表示 + 日別テーブル + バーチャート

10. `src/components/worklog/WorkLogActions.tsx` を作成
    - 全クリア（確認ダイアログ）+ CSV/JSONエクスポート

11. `src/components/worklog/WorkLogPanel.tsx` を作成
    - ログタブのメインパネル（一覧 + 分析 + アクション統合）

### Step 4: タブ統合

12. `src/components/sidebar/SidebarTabs.tsx` を作成
    - 2タブ切替（タスク追加 / ログ）

13. `src/App.tsx` を更新
    - SidebarTabs統合、useWorkLog接続、各ハンドラにrecordLog追加

### Step 5: テスト

14. ユーティリティテスト: `workLogStorage.test.ts`, `workLogExport.test.ts`
15. フックテスト: `useWorkLog.test.ts`
16. コンポーネントテスト: `WorkLogList.test.ts`, `WorkLogAnalysis.test.ts`

## テスト実行

```bash
# 全テスト実行
npm test

# リント
npm run lint

# 型チェック
npm run type-check

# テスト＋リント（CI向け）
npm test && npm run lint
```

## 動作確認チェックリスト

- [ ] タスクを作成すると「タスク作成」ログが記録される
- [ ] タスクがAuto-DispatchされるとCall Stackへの移動ログが記録される
- [ ] タスクをブロックすると「タスクブロック」ログが記録される
- [ ] タスクを完了すると経過時間付きの「タスク完了」ログが記録される
- [ ] タイマーをポーズ/再開すると対応するログが記録される
- [ ] サイドバーでタブを切替えてログ一覧が表示される
- [ ] 日付フィルタでログが絞り込める
- [ ] 分析セクションで完了タスク数・平均時間が表示される
- [ ] 日別バーチャートが表示される
- [ ] CSV/JSONエクスポートでファイルがダウンロードされる
- [ ] 全ログクリアが確認ダイアログ付きで動作する
- [ ] ブラウザを閉じてもログが保持される
- [ ] 5000件を超えるログで古いエントリが自動削除される

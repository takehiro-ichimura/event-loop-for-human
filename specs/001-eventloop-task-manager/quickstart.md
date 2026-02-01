# Quick Start Guide: EventLoop4Human

**日付**: 2026-02-02
**対象**: 開発者向けセットアップガイド

## 概要

EventLoop4Humanは、React + TypeScript + Viteで構築されたフロントエンドのみのWebアプリケーションです。このガイドでは、ローカル開発環境のセットアップからデプロイまでの手順を説明します。

## 前提条件

以下のツールがインストールされている必要があります：

- **Node.js**: v18.x以上（推奨: v20.x LTS）
- **npm**: v9.x以上（Node.jsに同梱）
- **Git**: バージョン管理用
- **Firebase CLI**: デプロイ用（オプション）

### Node.jsのインストール確認

```bash
node --version  # v18.0.0以上であることを確認
npm --version   # v9.0.0以上であることを確認
```

Node.jsがインストールされていない場合は、[公式サイト](https://nodejs.org/)からインストールしてください。

## プロジェクトのセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/event-loop-for-human.git
cd event-loop-for-human
```

### 2. 依存パッケージのインストール

```bash
npm install
```

インストールされる主要なパッケージ：
- `react` / `react-dom`: UI構築
- `vite`: ビルドツール
- `typescript`: 型チェック
- `@dnd-kit/core` / `@dnd-kit/sortable`: ドラッグ&ドロップ
- `vitest` / `@testing-library/react`: テスト

### 3. 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが起動し、ブラウザで `http://localhost:5173` が開きます。

**注**: ポート5173が使用中の場合、Viteが自動的に別のポートを割り当てます。

### 4. ホットリロードの確認

`src/App.tsx`を編集して、変更が即座にブラウザに反映されることを確認してください。

## プロジェクト構造

```text
event-loop-for-human/
├── src/
│   ├── components/       # Reactコンポーネント
│   │   ├── areas/        # 4つのエリアコンポーネント
│   │   ├── task/         # タスク関連コンポーネント
│   │   └── layout/       # レイアウトコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── types/            # 型定義（contracts/からコピー）
│   ├── utils/            # ユーティリティ関数
│   ├── styles/           # スタイル
│   ├── main.tsx          # エントリーポイント
│   └── App.tsx           # ルートコンポーネント
├── tests/
│   ├── unit/             # 単体テスト
│   └── integration/      # 統合テスト
├── public/               # 静的ファイル
├── specs/                # 仕様書・計画書
├── index.html
├── vite.config.ts        # Vite設定
├── tsconfig.json         # TypeScript設定
└── package.json
```

## 開発ワークフロー

### コーディング規約

- **ESLint**: コードの静的解析
- **Prettier**: コードフォーマット（推奨）
- **TypeScript Strict Mode**: 厳格な型チェック

### コードフォーマット

```bash
npm run format    # Prettierでフォーマット（設定済みの場合）
npm run lint      # ESLintでチェック
```

### 型チェック

```bash
npm run type-check  # TypeScriptの型チェック
```

## テストの実行

### すべてのテストを実行

```bash
npm run test
```

### Watch モードでテスト

```bash
npm run test:watch
```

開発中はWatch モードで実行し、ファイルの変更を検知して自動的にテストが実行されるようにすることを推奨します。

### カバレッジレポート

```bash
npm run test:coverage
```

カバレッジレポートが `coverage/` ディレクトリに生成されます。

### テストファイルの配置

- **単体テスト**: `tests/unit/` に配置
  - フック: `tests/unit/hooks/`
  - ユーティリティ: `tests/unit/utils/`
- **統合テスト**: `tests/integration/` に配置

### テストの例

```typescript
// tests/unit/hooks/useEventLoop.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEventLoop } from '../../../src/hooks/useEventLoop';

describe('useEventLoop', () => {
  it('Call Stackが空の時、Microtask Queueが優先される', () => {
    const { result } = renderHook(() => useEventLoop());

    act(() => {
      result.current.addTask({ name: 'Task 1' }, 'taskQueue');
      result.current.addTask({ name: 'Microtask 1' }, 'microtaskQueue');
    });

    act(() => {
      result.current.completeTask();
    });

    expect(result.current.callStack?.name).toBe('Microtask 1');
  });
});
```

## ビルドとデプロイ

### プロダクションビルド

```bash
npm run build
```

最適化されたビルド成果物が `dist/` ディレクトリに生成されます。

### ビルド結果のプレビュー

```bash
npm run preview
```

ローカルでプロダクションビルドをプレビューできます（`http://localhost:4173`）。

### Firebase Hostingへのデプロイ

#### 1. Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

#### 2. Firebaseにログイン

```bash
firebase login
```

ブラウザが開き、Googleアカウントでログインします。

#### 3. Firebaseプロジェクトの初期化

```bash
firebase init hosting
```

以下の設定を選択：
- **Public directory**: `dist`
- **Configure as single-page app**: `Yes`
- **Set up automatic builds**: `No`（オプション）

#### 4. デプロイ

```bash
npm run build         # ビルド
firebase deploy       # デプロイ
```

デプロイが完了すると、Hosting URLが表示されます（例: `https://your-project.web.app`）。

### 継続的デプロイ（GitHub Actions）

GitHub Actionsを使用して、`main`ブランチへのプッシュ時に自動デプロイすることも可能です。

`.github/workflows/deploy.yml` の例：

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## トラブルシューティング

### ポート5173が使用中

エラーメッセージ:
```
Port 5173 is in use, trying another one...
```

**解決策**: Viteが自動的に別のポート（5174など）を使用します。または、`vite.config.ts`でポートを変更：

```typescript
export default defineConfig({
  server: {
    port: 3000, // 任意のポート番号
  },
});
```

### LocalStorageが無効

ブラウザのプライベートモードでLocalStorageが無効の場合、アプリが正常に動作しない可能性があります。

**解決策**: 通常モードでブラウザを開くか、セッションストレージへのフォールバックが実装されていることを確認してください。

### 依存パッケージのインストールエラー

エラーメッセージ:
```
npm ERR! code ERESOLVE
```

**解決策**:
```bash
rm -rf node_modules package-lock.json
npm install
```

それでも解決しない場合は、Node.jsのバージョンを確認してください。

### ビルドエラー

TypeScriptの型エラーがある場合、ビルドが失敗します。

**解決策**:
```bash
npm run type-check  # エラーを確認
```

型エラーを修正してから、再度ビルドしてください。

## 次のステップ

1. **仕様書を読む**: [spec.md](./spec.md)で機能要件を確認
2. **データモデルを理解する**: [data-model.md](./data-model.md)でデータ構造を把握
3. **型定義を確認する**: [contracts/](./contracts/)で型定義を確認
4. **タスクリストを作成する**: `/speckit.tasks`コマンドで実装タスクを生成
5. **実装を開始する**: `/speckit.implement`コマンドで実装を開始

## リソース

- [Vite公式ドキュメント](https://vitejs.dev/)
- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [dnd-kit公式ドキュメント](https://docs.dndkit.com/)
- [Firebase Hosting公式ドキュメント](https://firebase.google.com/docs/hosting)
- [Vitest公式ドキュメント](https://vitest.dev/)

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

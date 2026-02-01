# event-loop-for-human Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-02

## 憲章への準拠 (Constitution Compliance)

このプロジェクトは `.specify/memory/constitution.md` で定義された憲章に準拠します。

**核心原則:**
1. **シングルスレッド実行**: 一度に一つのタスクのみに集中
2. **優先度自動化**: MicrotaskがTaskより優先（システムが自動管理）
3. **ターミナル美学**: ダークターミナルテーマ（黒背景+緑テキスト）、視覚的ノイズの排除

すべてのコード変更は上記3原則に準拠する必要があります。

## Active Technologies

- TypeScript 5.x, React 18.x (001-eventloop-task-manager)

## Project Structure

```text
src/
├── components/       # React components
│   ├── areas/       # Four area components (Call Stack, Microtask Queue, Task Queue, Web API)
│   ├── layout/      # Layout and error boundary
│   └── task/        # Task-related components
├── hooks/           # Custom hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Theme and style definitions (terminal color scheme)

tests/               # Test files (Vitest + React Testing Library)
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, React 18.x: Follow standard conventions

**追加ルール:**
- ターミナルカラースキームを遵守（黒背景 #0a0a0a、緑テキスト #00ff00）
- 各エリアのアクセントカラーを保持（Call Stack: マゼンタ、Microtask: シアン、Task Queue: 緑、Web API: オレンジ）
- 等幅フォント（Fira Code, JetBrains Mono等）を使用
- UIの複雑さを増やさない（正当化できない限り）
- イベントループ用語（Call Stack, Microtask, Task, Web API）を保持

## Recent Changes

- 001-eventloop-task-manager: Added TypeScript 5.x, React 18.x
- 2026-02-02: プロジェクト憲章 v1.0.1 を確立（ターミナル美学の原則を実装実態に合わせて修正）

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

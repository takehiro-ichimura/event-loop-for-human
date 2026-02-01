# Feature Specification: EventLoop4Human - イベントループ式タスク管理アプリ

**Feature Branch**: `001-eventloop-task-manager`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "JavaScriptのイベントループの仕組みを、人間のタスク管理に応用した個人向けタスク管理Webアプリ「EventLoop4Human」を作りたい。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 基本的なタスクフロー管理 (Priority: P1)

ユーザーは、Task Queueにタスクを追加し、Call Stackで1つずつタスクを実行し、完了させることができる。これはイベントループの基本動作を体験する最小限の機能である。

**Why this priority**: アプリの中核となる「シングルスレッド」コンセプトを実現する最も基本的なユーザー体験。この機能だけでも基本的なタスク管理ツールとして価値を提供できる。

**Independent Test**: Task Queueに新規タスクを追加し、Call Stackに自動投入され、完了ボタンでタスクが消え、次のタスクが投入されることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** Task Queueにタスクが1つ以上存在し、Call Stackが空の状態、**When** ページを表示する、**Then** Task Queueの先頭タスクが自動的にCall Stackに移動して表示される
2. **Given** Call Stackにタスクが表示されている状態、**When** 「完了」ボタンをクリックする、**Then** 該当タスクが消え、Task Queueの次のタスクが自動的にCall Stackに投入される
3. **Given** Task QueueとCall Stackが両方とも空の状態、**When** 新規タスクをTask Queueに追加する、**Then** 追加されたタスクが即座にCall Stackに移動して表示される
4. **Given** Call Stackにタスクが存在する状態、**When** Task Queueに新規タスクを追加する、**Then** 新規タスクはTask Queueに留まり、Call Stackの現在のタスクが完了するまで待機する

---

### User Story 2 - Microtask Queueによる優先タスク管理 (Priority: P2)

ユーザーは、現在実行中のタスクに関連する派生タスクをMicrotask Queueに追加し、Task Queueのタスクより優先的に処理できる。これによりJSイベントループのMicrotask優先処理を体験できる。

**Why this priority**: イベントループの特徴的な動作である「Microtaskの優先実行」を実現し、派生タスクと独立タスクの区別を明確にする。実用的なタスク管理の観点でも、関連タスクを優先処理できることは有用。

**Independent Test**: Task QueueとMicrotask Queueに両方タスクがある状態でCall Stackのタスクを完了し、Microtask Queueのタスクが優先的に投入されることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** Call Stackにタスクがあり、Microtask QueueとTask Queueの両方にタスクがある状態、**When** Call Stackのタスクを完了する、**Then** Task Queueではなく、Microtask Queueのタスクが優先的にCall Stackに投入される
2. **Given** Call Stackにタスクがあり、Microtask Queueに複数のタスクがある状態、**When** Call Stackのタスクを完了する、**Then** Microtask Queueのタスクがすべて連続して処理され、空になった後にTask Queueのタスクが投入される
3. **Given** 新規タスク追加画面が表示されている状態、**When** 投入先として「Microtask Queue」を選択してタスクを追加する、**Then** タスクがMicrotask Queueに追加される

---

### User Story 3 - Web APIによるブロッキングタスク管理 (Priority: P2)

ユーザーは、Call Stack上で実行中のタスクが他者の返事待ちなどで進められない場合、Web APIエリアに退避させ、条件が整った時に再度キューに戻すことができる。これはasync/awaitの待機状態を表現する。

**Why this priority**: 現実のタスク管理で頻繁に発生する「待ち状態」を適切に扱うための重要な機能。イベントループのWeb API概念を理解する上でも重要。P1と同等の重要度だが、基本フローの後に実装することで学習曲線が緩やかになる。

**Independent Test**: Call Stackのタスクを「ブロック → Web APIへ」ボタンでWeb APIに移動し、後でキューに戻せることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** Call Stackにタスクが表示されている状態、**When** 「ブロック → Web APIへ」ボタンをクリックする、**Then** 該当タスクがWeb APIエリアに移動し、次のタスクがCall Stackに投入される
2. **Given** Web APIエリアにタスクがある状態、**When** タスクを選択して「Task Queueへ戻す」操作を実行する、**Then** タスクがTask Queueに追加される
3. **Given** Web APIエリアにタスクがある状態、**When** タスクを選択して「Microtask Queueへ戻す」操作を実行する、**Then** タスクがMicrotask Queueに追加される

---

### User Story 4 - キュー内タスクの並べ替え (Priority: P3)

ユーザーは、Microtask QueueおよびTask Queue内のタスクをドラッグ&ドロップまたは上下ボタンで並べ替えることができる。これは「人間用アレンジ」として、実用性を高める。

**Why this priority**: 実用的なタスク管理には重要だが、イベントループのコンセプト理解には必須ではないため、P3とする。基本機能が完成した後のUX改善として実装。

**Independent Test**: キューに複数のタスクを追加し、並べ替え操作で順序が変わることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** Task Queueに3つ以上のタスクがある状態、**When** タスクをドラッグして別の位置にドロップする、**Then** タスクの順序が変更され、Call Stackへの投入順序も変更される
2. **Given** Microtask Queueに複数のタスクがある状態、**When** タスクの上下移動ボタンをクリックする、**Then** タスクが1つ上または下に移動する

---

### User Story 5 - タスク属性の管理 (Priority: P3)

ユーザーは、タスクに名前、見積もり時間、カテゴリ、メモを設定・編集できる。これにより実用的なタスク管理機能を強化する。

**Why this priority**: 実用性を高めるが、イベントループのコンセプト体験には直接関係しないため、P3とする。

**Independent Test**: タスクを作成・編集して各属性が保存・表示されることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** 新規タスク追加画面が表示されている状態、**When** タスク名、見積もり時間、カテゴリ、メモを入力して保存する、**Then** すべての属性が保存され、タスク表示時に確認できる
2. **Given** 任意のエリアにタスクが表示されている状態、**When** タスクをクリックして編集画面を開き、属性を変更する、**Then** 変更が即座に反映される
3. **Given** タスクに見積もり時間が設定されている状態、**When** タスク一覧を表示する、**Then** 各タスクに見積もり時間が視覚的に表示される

---

### User Story 6 - データの永続化 (Priority: P1)

ユーザーがブラウザを閉じても、すべてのタスクとその状態（どのエリアにあるか、属性など）がLocalStorageに保存され、再度開いた時に復元される。

**Why this priority**: 実用的なアプリケーションとして必須の機能。データが失われると使い物にならないため、P1とする。

**Independent Test**: タスクを追加してブラウザをリロードまたは閉じて再度開き、データが復元されることを確認することで、独立してテスト可能。

**Acceptance Scenarios**:

1. **Given** 各エリアにタスクが配置されている状態、**When** ブラウザをリロードする、**Then** すべてのタスクが元のエリアに復元され、属性も保持されている
2. **Given** Call Stackにタスクが表示されている状態、**When** ブラウザを閉じて再度開く、**Then** Call Stackに同じタスクが表示されている
3. **Given** LocalStorageにデータがない初回アクセスの状態、**When** アプリを開く、**Then** 空の状態が表示され、サンプルタスクやチュートリアルは表示されない

---

### Edge Cases

- Call Stackが空で、すべてのキューも空の場合、どのような表示になるか？（空状態のUI表示）
- Web APIに大量のタスク（例：50個以上）が蓄積された場合、どのように表示・管理するか？（スクロール、ページネーション、検索機能の必要性）
- LocalStorageの容量制限（通常5-10MB）に達した場合、どのように処理するか？（警告表示、古いタスクの削除提案）
- Microtask Queueに大量のタスク（例：20個以上）がある状態でCall Stackのタスクを完了した場合、すべて連続処理されるとUXが悪化する可能性がある（処理の一時停止や確認ダイアログの必要性）
- ブラウザのLocalStorageが無効化されている場合、どのように動作するか？（警告表示とセッションのみの動作）
- 複数のブラウザタブで同時に開いた場合、データの同期はどうするか？（同期しない想定だが、混乱を避けるための警告が必要か）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは、Call Stack、Microtask Queue、Task Queue、Web APIの4つのエリアを画面上に明確に区別して表示しなければならない
- **FR-002**: Call Stackには常に最大1つのタスクのみが表示され、複数のタスクが同時に表示されてはならない
- **FR-003**: ユーザーは新規タスクを作成する際、投入先（Microtask Queue / Task Queue / Web API）を選択できなければならない
- **FR-004**: ユーザーはタスクに対して、タスク名（必須）、見積もり時間、カテゴリ、メモを設定できなければならない
- **FR-005**: タスク名は必須項目であり、空のタスクは作成できないようにしなければならない
- **FR-006**: Call Stackが空の状態で、Microtask Queueにタスクがある場合、Microtask Queueの先頭タスクが自動的にCall Stackに投入されなければならない
- **FR-007**: Call Stackが空の状態で、Microtask Queueも空だがTask Queueにタスクがある場合、Task Queueの先頭タスクが自動的にCall Stackに投入されなければならない
- **FR-008**: Call Stackにタスクがある状態でタスクを完了すると、Microtask Queueにタスクがあれば優先的にすべて処理され、空になった後にTask Queueのタスクが投入されなければならない
- **FR-009**: ユーザーはCall Stack上のタスクを「ブロック」してWeb APIエリアに移動できなければならない
- **FR-010**: ユーザーはWeb APIエリアのタスクを選択し、Microtask QueueまたはTask Queueに手動で戻すことができなければならない
- **FR-011**: ユーザーはMicrotask QueueおよびTask Queue内のタスクの順序を変更できなければならない
- **FR-012**: すべてのタスクデータ（タスク属性、所属エリア、キュー内の順序）はブラウザのLocalStorageに自動保存されなければならない
- **FR-013**: アプリケーションを再度開いた際、LocalStorageからデータを読み込み、前回の状態を復元しなければならない
- **FR-014**: ユーザーはCall Stack上のタスクを完了させるための「完了」ボタンを使用できなければならない
- **FR-015**: タスク完了時、該当タスクは完全に削除され、履歴や完了済みリストには残らない（イベントループの動作に準拠）

### Key Entities

- **Task（タスク）**: ユーザーが管理する作業単位を表すエンティティ。属性として、一意のID、タスク名（必須）、見積もり時間（任意）、カテゴリ（任意）、メモ（任意）、作成日時、現在の所属エリア（Call Stack / Microtask Queue / Task Queue / Web API）、キュー内の順序位置を持つ。
- **Area（エリア）**: タスクが配置される4つの領域（Call Stack、Microtask Queue、Task Queue、Web API）を表す概念。各エリアは特定のルールに基づいてタスクを管理する。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ユーザーは初めてアプリを使用する際、5分以内にイベントループの基本コンセプト（シングルスレッド、Microtask優先、ブロッキング）を理解できる
- **SC-002**: ユーザーは新規タスクの作成から完了までの一連の操作を、平均30秒以内に実行できる
- **SC-003**: Task QueueとMicrotask Queueを含めて合計50個のタスクを管理しても、画面の応答性が低下せず、タスクの移動や完了操作が1秒以内に完了する
- **SC-004**: ユーザーがブラウザをリロードした際、すべてのタスクとその状態が2秒以内に復元される
- **SC-005**: 4つのエリア（Call Stack、Microtask Queue、Task Queue、Web API）の役割と違いが、画面デザインだけで直感的に理解できる（90%のユーザーが説明なしで理解）
- **SC-006**: ユーザーの80%以上が、従来のタスク管理ツールと比較して「タスクの優先順位付けがしやすい」と評価する
- **SC-007**: Microtask Queueの優先処理動作が視覚的に明確に表現され、ユーザーの90%以上が「派生タスクが優先される理由を理解できた」と回答する

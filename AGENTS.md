# AGENTS.md — エージェント向け作業指示書

このファイルは Polish Layer プロジェクトで作業する AIエージェント（Claude Code / Cursor / Devin / GitHub Copilot Workspace 等）に対する恒久的な作業指示である。

**作業開始前に必ず全文を読むこと。** 不明点があれば作業を進めず質問すること。

---

## 1. あなたの役割

あなたは Polish Layer の実装を担当するエンジニアである。プロジェクトオーナー（以下「ユーザー」）の意図を汲み、本リポジトリのドキュメントに沿って一貫性のある実装を行う。

---

## 2. プロジェクトの目的（要約）

darake-dev-app-AI が設計図を完成品に仕上げる際に呼び出す、企業クオリティの素材・部品・ノウハウを供給する **素材工房バックエンド** を構築する。

詳細は `docs/00_workshop_master_plan.md`（最重要）および `docs/01_concept.md` を参照。

---

## 3. 作業開始時の必須手順

新しいタスクに着手する前に、**必ず以下の順序でドキュメントを読むこと**。

1. `README.md`（プロジェクト全体像）
2. `AGENTS.md`（本ファイル）
3. `docs/00_workshop_master_plan.md`（全体方針・最重要）
4. `docs/quality-criteria.md`（素材品質基準）
5. `docs/antipatterns.md`（反パターン集）
6. `docs/02_architecture.md`（設計）
7. `docs/04_mcp-api-spec.md`（MCP API 仕様）
8. `docs/05_connectors.md`（コネクタ仕様）
9. 該当タスクに関連する追加ファイル

読まずに実装を始めることは禁止。

### 必読ファイル（上記手順の補足）

以下は上記「必須手順」を具体化したリストである。順序・内容は手順と一致している。

| ファイル | 目的 |
|---|---|
| `docs/00_workshop_master_plan.md` | 全体方針（最重要） |
| `docs/quality-criteria.md` | 素材品質基準（棚に並べてよいかの判定） |
| `docs/antipatterns.md` | 反パターン集（やってはいけないこと） |
| `docs/02_architecture.md` | アーキテクチャ |
| `docs/04_mcp-api-spec.md` | MCP API 仕様 |
| `docs/05_connectors.md` | コネクタ仕様 |
| `AGENTS.md`（本ファイル） | 運用ルール |

以下は後続 PR で追加予定（追加され次第、本リストに加える）:
- `docs/styles/*.md` （スタイル基準、PR-α1.5-c）
- `docs/layouts/*.md` （配置パターン基準、PR-α1.5-d）
- `docs/curation-criteria.md` （AI Vision キュレーション基準、PR-α1.5-e）

---

## 4. 現在のフェーズと作業範囲

現在のフェーズは `README.md` の「現在のフェーズ」セクションで確認する。

各フェーズの作業範囲：

- **Phase 0**：ドキュメント整備のみ。コード実装禁止。
- **Phase 1**：MCPサーバー雛形（7メソッドの空実装）
- **Phase 2**：Connector 実装（SF Symbols → Iconify → Google Fonts → useAnimations → freesound の順）
- **Phase α**: 素材棚完成（コネクタ全種実装 + AI Vision キュレーション + 同梱バックアップ）
- **Phase β**: 部品棚（画面テンプレート + UI コンポーネント + 配置パターン）
- **Phase γ**: ノウハウ棚（カテゴリ別レシピ）
- **Phase δ**: API 拡充（残りメソッド実装）
- **Phase ε**: 工房窓口アプリ（棚閲覧 + キュレーション削除 UI）
- **Phase 3〜6（旧計画）** ：廃止。Style Bible 生成・管理、QC Gate、コード生成、デプロイ等の責務は darake-dev-app-AI 側に移管済み。

**現在のフェーズ外の作業を勝手に進めないこと。**

---

## 5. コア設計原則（変更厳禁）

以下の原則は本プロジェクトの根幹である。逸脱する実装は受け入れられない。

1. **自前でアセットを抱えない。** 既存外部API（SF Symbols / Iconify / Google Fonts / freesound / LottieFiles 等）をオーケストレーションする。
2. **供給品質・取得確実性・ライセンス整合性を担保する。** Polish Layer の責務はここに集中する。
3. **MCP優先、REST はフォールバック。** インターフェースは MCP メソッドを基準に設計する。
4. **ライセンス情報を必ず付与。** 各アセットには使用可能ライセンス範囲のメタデータを添える。
5. **Style Bible 生成・管理、コード生成、QC 検査は darake-dev-app-AI 側の責務。** Polish Layer はこれらを実装しない。

---

## 6. コーディング規約

- **言語**：TypeScript（strict mode）
- **フレームワーク**：Hono（または Fastify）
- **スキーマ検証**：zod
- **DB**：Postgres + pgvector（Prisma 経由）
- **フォーマッタ**：Prettier
- **リンタ**：ESLint
- **テスト**：Vitest
- **インデント**：スペース2
- **文字列**：シングルクォート
- **セミコロン**：あり
- **import順序**：標準ライブラリ → 外部 → 内部 の3グループ、グループ間に空行

ファイル命名は `kebab-case`（例：`style-bible.ts`）、型・クラスは `PascalCase`、関数・変数は `camelCase`。

---

## 7. ディレクトリ規約

```
src/
├── mcp/          MCPサーバー本体・メソッド・スキーマ
├── connectors/   外部API接続（1API = 1ファイル）
├── pipeline/     変換・正規化パイプライン（将来拡張）
├── qc/           素材整合性チェック用途（将来拡張）
├── memory/       キャッシュ・記録用途（将来拡張）
└── utils/        共有ユーティリティ
```

**新規ディレクトリを勝手に追加しないこと。** 必要な場合はユーザーに提案して承認を得る。

---

## 8. コミット規約

Conventional Commits に従う。

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメントのみ
- `refactor:` 動作を変えないリファクタ
- `test:` テスト追加・修正
- `chore:` ビルド・設定変更

例：`feat(connectors): add SF Symbols connector`

1コミット1目的。複数の目的を混ぜないこと。

---

## 9. 質問・確認のルール

以下の場合は実装を進めず**必ずユーザーに確認すること**。

- ドキュメントに記載がない設計判断が必要なとき
- 既存の設計原則と矛盾しそうなとき
- 外部APIの仕様変更や制限に直面したとき
- ライセンス上の懸念があるとき
- 新しい依存パッケージを追加したいとき

「だいたいこうだろう」での推測実装は禁止。

---

## 10. 禁止事項

- ドキュメントを読まずに実装を始めること
- 現在のフェーズ外の作業を勝手に進めること
- コア設計原則（第5項）に反する実装
- ライセンス未確認のアセットの取り込み
- `.env` ファイルや秘密鍵のコミット
- ユーザーに無断での大規模リファクタ
- `node_modules`、`dist`、ビルド成果物のコミット
- テストなしの機能追加（Phase 1 以降）

---

## 11. 成功基準

darake-dev-app-AI が Polish Layer の素材を使って App Store にアプリを1本リリースし、レビュー★4.5を取れることが成功基準である。すべての実装判断はこの基準に照らして行うこと（App Store リリース自体は darake-dev-app-AI 側の責務）。

---

## 12. 困ったときに参照する場所

- 用語の意味がわからない → `docs/08_glossary.md`
- API仕様 → `docs/04_mcp-api-spec.md`
- スキーマ → `specs/`
- 過去の決定理由 → `docs/` 各ファイル末尾の「設計判断の記録」セクション

それでも不明な場合は作業を止めてユーザーに質問する。

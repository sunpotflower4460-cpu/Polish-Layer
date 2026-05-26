# Polish Layer

AIエージェント単体でも、大手スタジオレベルの品質でモバイルアプリを作れるようにするための「品質補完レイヤー」。

## このプロジェクトは何か

AIエージェント（Claude Code / Cursor / Devin / GitHub Copilot Workspace 等）がアプリを作る際、ロジックは書けても **UI/UX・アイコン・アニメーション・サウンド・コピー** の品質が毎回ガチャになり、プロジェクトごとに0から再構築される問題を解決する。

Polish Layer は、エージェントが MCP（Model Context Protocol）または REST で接続して呼び出せる **品質補完サーバー** であり、以下を提供する。

- **Style Bible**：プロジェクト固有のスタイル規定（色・タイポ・余白・モーション・サウンド基準）
- **Asset Connectors**：SF Symbols / Iconify / Google Fonts / LottieFiles / freesound 等の外部APIを統一インターフェースで提供
- **QC Gate**：Apple HIG / WCAG 準拠の自動品質検査
- **Code Generator**：Style Bible を反映した SwiftUI / React Native コード片の生成

## MVP のスコープ

App Store 向け 一般モバイルアプリ（SaaS、ツール、ライフスタイル）。ゲームや3Dは将来拡張。

## 現在のフェーズ

**Phase 2 進行中（PR-A 完了、PR-B 進行中）**

## Phase 0 完了条件

以下がすべて満たされた時点で Phase 1（MCPサーバー雛形）に進む。

- [x] `docs/01〜08` が揃っている
- [x] `specs/` の schema が JSON Schema draft-07 validator で構文エラーなく動作する
- [x] schema と templates の整合が取れている（テンプレート用 schema と確定用 schema が分離されている）
- [x] APIレスポンス形が `docs/04` と `docs/05` で完全一致している（特に `license_info`）
- [x] 同期/非同期の契約が `docs/04` に明記されている
- [x] Phase 1 で作る `src/` 初期ディレクトリ構成が `AGENTS.md` の規約と一致している

このチェックリストは Phase 0.5 完了時に全項目を埋めること。

## Phase 1 完了条件

- [x] `package.json` / `tsconfig.json` / lint / format / test 環境が整備されている
- [x] `src/` 配下のディレクトリ骨格が `AGENTS.md` の規約と一致している
- [x] 6つの MCP メソッドが zod スキーマ付きで実装されている（中身はスタブ可）
- [x] `polish.init_project` のみ実動作する（テンプレ読込 + project_id 注入）
- [x] `npm test` で全テストが通る
- [x] `npm run dev` でローカル起動できる

## Phase 2 完了条件

- [x] SF Symbols Connector（PR-A）
- [x] Iconify Connector（PR-B1）
- [x] Google Fonts Connector（PR-B1）
- [ ] Animations Connector（useAnimations ベース、PR-B）
- [ ] freesound Connector（PR-B）
- [x] `polish.get_icon` が SF Symbols 経由で実動作
- [x] `polish.get_icon` が Iconify 経由で実動作
- [ ] `polish.get_animation` が実動作
- [ ] `polish.get_sound` が実動作
- [x] `polish.get_font` via Google Fonts

## ローカル開発

```bash
npm install
npm run dev      # MCP サーバーをローカル起動（stdio transport）
npm test         # ユニットテスト実行
npm run lint     # Lint
npm run typecheck # 型チェック
```

### アセット配置ポリシー

ランタイムで参照するローカルデータファイル（コネクタ用の JSON メタデータ等）は `assets/<connector-name>/` 以下に配置する。`src/` 配下は TypeScript ソースのみとし、ビルド成果物（`dist/`）へのコピーが不要な構造とする。`resolveFromRoot()` はプロジェクトルート（`package.json` が存在するディレクトリ）を基準にパスを解決するため、`npm run dev`（tsx）と `npm start`（dist）のどちらの実行形態でも同一パスで参照できる。

### 環境変数

`.env` はコミットせず、実行環境で以下を設定する。

- `GOOGLE_FONTS_API_KEY`
- `FREESOUND_API_KEY`
- `FREESOUND_CLIENT_ID`

## エージェントへ

作業を始める前に必ず **AGENTS.md** を読むこと。

AGENTS.md には作業の進め方、参照すべきドキュメントの順序、コーディング規約、禁止事項が記載されている。

## ドキュメント構成

| パス | 内容 |
|---|---|
| AGENTS.md | エージェント向け作業指示書（最重要） |
| docs/01_concept.md | プロジェクトコンセプト |
| docs/02_architecture.md | システム全体設計 |
| docs/03_style-bible-spec.md | Style Bible 仕様 |
| docs/04_mcp-api-spec.md | MCP メソッド仕様 |
| docs/05_connectors.md | 外部API接続仕様 |
| docs/06_qc-rules.md | QC Gate 判定基準 |
| docs/07_codegen-rules.md | コード生成規約 |
| docs/08_glossary.md | 用語集 |
| specs/ | 機械可読な仕様（JSON Schema 等） |
| templates/ | Style Bible カテゴリ別プリセット |

## ライセンス

未定（MVP完成までに決定）
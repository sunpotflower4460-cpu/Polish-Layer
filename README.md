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

**Phase 0：ドキュメント整備中**（コードはまだ実装されていない）

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
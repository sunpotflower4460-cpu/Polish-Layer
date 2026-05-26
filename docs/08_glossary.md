# 08. 用語集

このファイルはプロジェクト内で使用する用語の定義集。不明な用語はまずここを参照すること。

---

## A

### Asset Connector
外部アセットAPI（SF Symbols / Iconify / LottieFiles / freesound 等）への接続モジュール。共通インターフェース（`search` / `normalize` / `getLicenseInfo`）を実装する。詳細は `docs/05_connectors.md`。

### Attribution（帰属表示）
クリエイティブ・コモンズなど一部ライセンスで要求される、著作者の名前・作品名・ライセンスの表示義務。`LicenseInfo.attribution_required` フラグで管理する。

---

## C

### Category
Style Bible の分類軸。`productivity | social | finance | health | utility` の5種。カテゴリに応じたテンプレートと QC 閾値が適用される。

### Code Generator
`polish.get_screen` が実行するコード片生成機能。Style Bible の値を参照し、SwiftUI または React Native のコンポーネントコードを出力する。詳細は `docs/07_codegen-rules.md`。

---

## G

### Gateway
エージェントからのリクエストを受け取り、意図解釈・Style Bible 注入・各 Connector へのルーティングを行う中枢モジュール。詳細は `docs/02_architecture.md`。

---

## L

### License Type
アセットの商用利用可否と帰属表示義務を示す分類。本プロジェクトで使用する種別：
- `CC0`：パブリックドメイン相当。帰属不要。
- `MIT`：帰属表示あり。商用利用可。
- `Apache-2.0`：帰属表示あり。商用利用可。特許条項あり。
- `free-commercial`：商用利用可（プラットフォーム独自ライセンス）。
- `paid`：有料ライセンス。
- `apple-system`：SF Symbols など Apple 提供素材。Apple プラットフォームでのみ使用可。
- `restricted`：商用利用不可。検索結果から除外する。

### LUFS（Loudness Units relative to Full Scale）
音声のラウドネス（知覚音量）の単位。Polish Layer では UI SE を **-16 LUFS ±2** に正規化する。

---

## M

### MCP（Model Context Protocol）
Anthropic が策定した、AIエージェントとツールサーバー間の通信プロトコル。Polish Layer は MCP サーバーとして動作し、6つのメソッドを公開する。

---

## P

### Phase
プロジェクトの開発段階。Phase 0（ドキュメント整備）〜 Phase 6（デプロイ）まで定義されている。現在のフェーズは `README.md` で確認する。

### Pipeline Adapter
外部APIから取得したアセットを統一フォーマットに変換する層。SVG正規化・フォントサブセット・音声ノーマライズ等を行う。

### Polish Layer
本プロジェクト全体の名称。AIエージェントのアプリ品質を補完する MCP/REST サーバー。

---

## Q

### QC Gate
生成物が Apple HIG / WCAG / App Store Review Guidelines に準拠しているかを自動検査するモジュール。`error` 違反は差し戻し、`warning` は通知のみ。詳細は `docs/06_qc-rules.md`。

---

## R

### Reference Memory
採用された組み合わせ（アイコン・アニメ・サウンド等）と評価指標（App Storeレビュー・継続率）を蓄積するデータベース。pgvectorで意図埋め込みを保存し、類似検索を高速化する。

### References
Style Bible 生成時に指定する参照タイトル配列（例：`["Linear", "Things 3"]`）。デザイン方向性のインプットとして使用する。

---

## S

### Safe Area
iPhone のノッチ・Dynamic Island・ホームインジケータを避けた描画可能領域。HIG に従い、コンテンツは Safe Area 内に収める必要がある（QC Gate で `error` 判定）。

### Style Bible
プロジェクトごとのスタイル規定 JSON。カラー・タイポグラフィ・スペーシング・モーション・サウンド・コピートーンを定義し、すべての生成物の Single Source of Truth となる。詳細は `docs/03_style-bible-spec.md`。

### Style Bible Template
カテゴリ別に事前定義されたスタイルのプリセット。`templates/style-bible/<category>.json` に格納される。

---

## V

### VLM（Vision Language Model）
画像を解析できる大規模言語モデル（Claude Sonnet / GPT-4o 等）。参照タイトルのスクリーンショットからデザイン特徴を抽出する際に使用（将来拡張）。

### VoiceOver
iOS の画面読み上げアクセシビリティ機能。主要操作要素には適切なラベルを付与すること（QC Gate で `warning` 判定）。

---

## W

### WCAG（Web Content Accessibility Guidelines）
W3C が策定したアクセシビリティ基準。Polish Layer では **WCAG AA** 準拠をデフォルト要件とし、カラーコントラスト比（通常テキスト 4.5:1 以上）を QC Gate で自動検査する。

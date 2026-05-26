# Polish Layer マスタープラン（工房バックエンド構想 v3）

## 1. ポジショニング

### 1.1 Polish Layer とは何か

Polish Layer は、darake-dev-app-AI が「設計図を完成品にする」際に呼び出す、企業クオリティの素材・部品・ノウハウを供給する MCP バックエンドである。

### 1.2 役割分担

| レイヤー | 役割 |
|---|---|
| 周波数具現化マップアプリ | アイデア → 設計図 |
| darake-dev-app-AI | 設計図 → 完成品（実装統括） |
| **Polish Layer（本リポジトリ）** | **素材・部品・ノウハウ供給** |

### 1.3 やらないこと

- ユーザー向け UI（チャット入力、プレビュー画面、公開支援）→ darake-dev-app-AI 側
- コード生成（SwiftUI / React Native の組み立て）→ darake-dev-app-AI 側
- App Store / Google Play 申請支援 → darake-dev-app-AI 側
- VLM による参考画像解析 → darake-dev-app-AI 側
- ゲーム領域（3D アセット、Unity/Unreal 連携）→ 当面スコープ外

## 2. 工房の構造（5 つの棚）

```
Polish Layer 工房
├── 素材棚 (Material Shelf)
│   ├── アイコン棚（SF Symbols / Iconify / Lucide / Phosphor / Heroicons …）
│   ├── フォント棚（Google Fonts / Fontsource）
│   ├── アニメ棚（useAnimations / LottieFiles Free）
│   ├── 効果音棚（freesound）
│   ├── 画像棚（Unsplash / Pexels）
│   └── イラスト棚（unDraw / Storyset）
├── 部品棚 (Component Shelf)
│   ├── 画面テンプレート（30 種 × 6 スタイル）
│   ├── UI コンポーネント
│   └── 配置パターン（30 種）
├── ノウハウ棚 (Knowhow Shelf)
│   ├── カテゴリ別レシピ
│   ├── インスピレーション集
│   └── アンチパターン集
├── 接続口 (Connection API)
│   └── MCP メソッド（polish.get_*）
└── 工房窓口アプリ (Visualization App)
    └── 棚の閲覧 + キュレーション削除 UI
```

### 2.1 3 階層構造

すべての棚は以下の 3 層で構成する:

| 階層 | 用途 |
|---|---|
| `signature` | AI が迷ったら最初に選ぶ最上位品質（数十〜数百） |
| `curated` | 用途別の定番、品質スコア 0.7 以上（数千） |
| `all` | 接続経由で都度取得、フォールバック用（数万〜数十万） |

素材を棚に振り分ける際の判定基準は `docs/quality-criteria.md` に、棚に並べてはいけない反パターンは `docs/antipatterns.md` に定義されている。
提供される棚は `signature` / `curated` / `all` の 3 種。`pending` は人間レビュー待ちキュー、`reject` は却下ログで、いずれも API 応答には含めない。

### 2.2 取得確実性 3 層冗長化

1. リアルタイム接続（公式 API）
2. ローカルキャッシュ（24h TTL）
3. 同梱バックアップ（signature 素材をリポジトリに同梱）

## 3. MCP API 設計（最終形 13 メソッド）

| # | メソッド | 役割 | 状態 |
|---|---|---|---|
| 1 | `polish.init_project` | プロジェクト初期化 | ✅ stub |
| 2 | `polish.get_icon` | アイコン取得 | ✅ SF/Iconify |
| 3 | `polish.get_font` | フォント取得 | ✅ Google Fonts |
| 4 | `polish.get_animation` | アニメ取得 | ⏳ PR-B2 |
| 5 | `polish.get_sound` | 効果音取得 | ⏳ PR-B2 |
| 6 | `polish.get_image` | 画像取得 | ⏳ Phase α-2 |
| 7 | `polish.get_illustration` | イラスト取得 | ⏳ Phase α-2 |
| 8 | `polish.get_template` | 画面テンプレート | ⏳ Phase β |
| 9 | `polish.get_component` | UI 部品 | ⏳ Phase β |
| 10 | `polish.get_layout_pattern` | 配置パターン | ⏳ Phase β |
| 11 | `polish.get_recipe` | カテゴリ別レシピ | ⏳ Phase γ |
| 12 | `polish.list_shelf` | 棚の中身一覧 | ⏳ Phase ε |
| 13 | `polish.remove_from_shelf` | キュレーション削除 | ⏳ Phase ε |
| – | `polish.get_screen` | コード生成（旧計画） | ⚠️ Deprecated（darake 側へ移管） |
| – | `polish.qc_check` | QC 検査（旧計画） | ⚠️ Deprecated（darake 側へ移管） |

### 3.1 廃止予定メソッド

以下は darake-dev-app-AI 側に責務移管されるため将来削除予定。本 PR ではコードは残し、ドキュメント上で deprecated と告知する。

- `polish.get_screen`（コード生成は darake 側）
- `polish.qc_check`（品質検査は darake 側）

## 4. ロードマップ（フェーズ構成）

- **Phase α**: 素材棚完成（コネクタ全種実装 + AI Vision キュレーション + 同梱バックアップ）
- **Phase β**: 部品棚（画面テンプレート + UI コンポーネント + 配置パターン）
- **Phase γ**: ノウハウ棚（カテゴリ別レシピ）
- **Phase δ**: API 拡充（残りメソッド実装）
- **Phase ε**: 工房窓口アプリ（Next.js/Astro）

## 5. 廃止される旧設計

- ❌ Phase 5（Code Generator / SwiftUI / React Native）→ darake-dev-app-AI 側
- ❌ Phase 6（Deploy & Dog-food / App Store ★4.5）→ darake-dev-app-AI 側
- ❌ Phase 6.5（UX Layer / Polish Layer Studio）→ darake-dev-app-AI 側
- ❌ Phase 7〜12（ゲーム領域、Unity/Unreal、3D アセット）→ 当面スコープ外
- ❌ Phase 13〜16（AI 演出ディレクター等）→ 構想として保留
- ❌ Style Bible の生成・管理 → darake-dev-app-AI 側
- ❌ VLM による参考画像解析 → darake-dev-app-AI 側

## 6. 成功指標

| 指標 | 目標値 |
|---|---|
| signature 棚の品質 | quality_score 平均 ≥ 0.9 |
| 接続成功率 | ≥ 99.5% |
| ライセンス整合性 | 100% |
| MCP メソッド数 | 13 種 |
| darake-dev-app-AI からの呼び出し成功率 | ≥ 99% |

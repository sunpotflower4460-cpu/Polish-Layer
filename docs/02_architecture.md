# 02. アーキテクチャ

## 1. 概要: 工房バックエンドとしての Polish Layer

Polish Layer は darake-dev-app-AI が実装時に呼び出す「素材工房バックエンド」であり、素材・部品・ノウハウを MCP API 経由で供給する。ユーザー向け UI やコード生成実行は darake-dev-app-AI 側の責務とし、本リポジトリは供給品質・取得確実性・ライセンス整合性を担保する。

## 2. レイヤー構造: MCP Server → Connector 層 → Asset 層

```
┌─────────────────────────────────────────────┐
│ darake-dev-app-AI / 各種 AI クライアント      │
└──────────────────────┬──────────────────────┘
                       │ MCP
┌──────────────────────▼──────────────────────┐
│ MCP Server Layer (`src/mcp/`)               │
│ - ツール公開 (`polish.*`)                   │
│ - 入出力スキーマ検証                         │
│ - エラー正規化                               │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│ Connector Layer (`src/connectors/`)         │
│ - 外部 API 接続                              │
│ - ソース別レスポンス正規化                   │
│ - ライセンス情報付与                         │
└──────────────────────┬──────────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│ Asset Layer (`assets/`)                      │
│ - 同梱済み素材データ                          │
│ - fallback 用メタデータ                       │
└─────────────────────────────────────────────┘
```

## 3. ディレクトリ構造（`src/` 最新）

```text
src/
├── connectors/   外部 API / データソース接続
├── mcp/          MCP サーバー・メソッド・スキーマ
├── memory/       キャッシュ・記録用途（将来拡張）
├── pipeline/     変換・正規化パイプライン（将来拡張）
├── qc/           素材整合性チェック用途（将来拡張）
├── utils/        共有ユーティリティ
└── index.ts      エントリーポイント
```

## 4. 3 階層棚構造（signature / curated / all）

```text
各棚（icon / font / animation / ...）
├── signature  最上位品質の厳選セット（最優先）
├── curated    用途別の定番セット（品質スコア閾値あり）
└── all        接続先全体から都度取得するフォールバック
```

- `signature`: AI が迷った場合に最初に返す推奨層
- `curated`: 品質と網羅性のバランスを取る通常層
- `all`: ヒット不足時の補完層

## 5. 取得確実性 3 層冗長化（API → cache → bundled）

```text
1) Real-time API
   └─ 公式 API から最新素材を取得
        ↓ 失敗時
2) Local Cache (TTL 24h)
   └─ 直近成功レスポンスを再利用
        ↓ 失敗時
3) Bundled Backup
   └─ リポジトリ同梱の signature 素材を返却
```

この構成により、外部 API 障害時も最低限の素材供給を継続する。

## 6. darake-dev-app-AI との接続シナリオ（コード例）

```ts
// 1. プロジェクト初期化
await polish.init_project({ category: 'finance', style: 'notion' });

// 2. レシピ取得（推奨スタイル・配置・素材組み合わせ）
await polish.get_recipe({ project_id, category: 'finance' });

// 3. テンプレート取得
await polish.get_template({ project_id, screen_type: 'dashboard', style: 'notion' });

// 4. アイコン取得（signature 棚から）
await polish.get_icon({ project_id, semantic: 'wallet', shelf_tier: 'signature' });

// 5. フォント取得
await polish.get_font({ project_id, category: 'sans-serif' });
```

上記フローで darake-dev-app-AI は設計図に合わせた素材・部品を取得し、実装統括を行う。

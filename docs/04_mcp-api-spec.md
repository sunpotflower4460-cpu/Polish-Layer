# 04. MCP API 仕様

## 概要

Polish Layer は MCP（Model Context Protocol）サーバーとして **7 つのメソッド**を公開する。REST フォールバックも同等のエンドポイントを提供。

## 処理モデル契約

### MVP 契約

すべてのメソッドは**同期処理**として実装する。

- レスポンスタイム目標：平均 < 500ms、p95 < 2秒
- 上記制約を超える可能性のある処理（VLM自動解析、音声変換、Lottie実行時検査）は **MVPのスコープ外**
- MVP段階の Style Bible 生成は「テンプレート選択 + 静的注入」のみ
- MVP段階の QC Gate は「静的解析・メタデータ検査」のみ

### 将来拡張

MVP制約を超える機能を追加する際は、以下のパターンで非同期化する：

1. メソッドは即座に `{ "status": "pending", "job_id": "uuid" }` を返す
2. クライアントは `polish.get_job_status(job_id)` でポーリング
3. 完了時は `{ "status": "completed", "result": {...} }` を返す

このパターン適用時は、本ドキュメントに対象メソッドを明示する。

## メソッド一覧

| メソッド | 用途 |
|---|---|
| `polish.init_project` | Style Bible を生成・固定 |
| `polish.get_screen` | 画面のコード片＋アセット一式を取得 |
| `polish.get_icon` | アイコンを意味語で取得 |
| `polish.get_font` | フォントを family 名 / category で取得 |
| `polish.get_animation` | アニメーションを意図で取得 |
| `polish.get_sound` | UI SE / BGM を取得 |
| `polish.qc_check` | 生成物の品質検査 |

---

## 詳細

### polish.init_project

**入力**
```json
{
  "references": ["Linear", "Things 3"],
  "category": "productivity",
  "platform": "ios"
}
```

**出力**
```json
{
  "project_id": "uuid",
  "style_bible": { /* Style Bible オブジェクト */ }
}
```

---

### polish.get_screen

**入力**
```json
{
  "project_id": "uuid",
  "intent": "ログイン画面、メール+パスワード、SNS連携あり",
  "framework": "swiftui | react-native"
}
```

**出力**
```json
{
  "code": "/* SwiftUI コード片 */",
  "assets": [
    {
      "type": "icon",
      "name": "envelope",
      "source": "sf-symbols",
      "license_info": {
        "type": "apple-system",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://developer.apple.com/sf-symbols/"
      }
    },
    {
      "type": "lottie",
      "url": "https://...",
      "license_info": {
        "type": "free-commercial",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://lottiefiles.com/"
      }
    }
  ],
  "qc_passed": true,
  "warnings": []
}
```

---

### polish.get_icon

**入力**
```json
{
  "project_id": "uuid",
  "semantic": "設定",
  "preferred_source": "sf-symbols"
}
```

**出力**
```json
{
  "candidates": [
    {
      "name": "gearshape",
      "source": "sf-symbols",
      "preview_url": "...",
      "license_info": {
        "type": "apple-system",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://developer.apple.com/sf-symbols/"
      }
    },
    {
      "name": "settings",
      "source": "iconify",
      "preview_url": "...",
      "license_info": {
        "type": "MIT",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://iconify.design/"
      }
    }
  ]
}
```

**主要エラーコード**
- `INVALID_INPUT`
- `UPSTREAM_ERROR`
- `MISSING_ENV`（将来の認証付きアイコンソース追加に備えた共通コード）

---

### polish.get_font

**入力**
```json
{
  "project_id": "uuid",
  "semantic": "Roboto",
  "category": "sans-serif",
  "max_results": 10
}
```

**出力**
```json
{
  "candidates": [
    {
      "family": "Roboto",
      "category": "sans-serif",
      "variants": ["100", "300", "400", "500", "700", "900"],
      "subsets": ["latin", "latin-ext"],
      "source": "google-fonts",
      "preview_url": "https://fonts.google.com/specimen/Roboto",
      "license_info": {
        "type": "free-commercial",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://fonts.google.com/attribution"
      }
    }
  ],
  "qc_passed": true
}
```

**主要エラーコード**
- `INVALID_INPUT`
- `UPSTREAM_ERROR`
- `MISSING_ENV`（`GOOGLE_FONTS_API_KEY` 未設定）

---

### polish.get_animation

**入力**
```json
{
  "project_id": "uuid",
  "intent": "成功時のチェックマーク、控えめ",
  "max_results": 3
}
```

**出力**
```json
{
  "candidates": [
    {
      "url": "https://lottiefiles.com/...",
      "preview_url": "...",
      "duration_ms": 1200,
      "license_info": {
        "type": "free-commercial",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://lottiefiles.com/"
      }
    }
  ]
}
```

---

### polish.get_sound

**入力**
```json
{
  "project_id": "uuid",
  "event": "tap | success | error | notification",
  "duration_max_ms": 500
}
```

**出力**
```json
{
  "candidates": [
    {
      "url": "https://...",
      "format": "aac",
      "loudness_lufs": -16,
      "license_info": {
        "type": "CC0",
        "attribution_required": false,
        "commercial_use": true,
        "source_url": "https://freesound.org/"
      }
    }
  ]
}
```

---

### polish.qc_check

**入力**
```json
{
  "project_id": "uuid",
  "artifact_type": "swiftui_code | image | audio",
  "content": "..."
}
```

**出力**
```json
{
  "passed": false,
  "violations": [
    {
      "rule": "contrast_ratio",
      "severity": "error",
      "message": "primary on bg の比率が 3.2:1 (要 4.5:1)",
      "suggestion": "primary を #0066CC に変更"
    }
  ]
}
```

---

## エラーハンドリング

すべてのメソッドは以下のエラー形式を返す。

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

**エラーコード：**
- `INVALID_INPUT`：入力スキーマ違反
- `PROJECT_NOT_FOUND`：project_id が存在しない
- `UPSTREAM_ERROR`：外部API障害
- `LICENSE_RESTRICTED`：商用利用不可アセットのみヒット
- `RATE_LIMITED`：レート制限
- `MISSING_ENV`：必要な環境変数（APIキー等）が未設定
- `NOT_IMPLEMENTED`：Phase 2B で実装予定の機能が呼ばれた場合の一時コード。完了後削除

## レート制限

MVPでは `project_id` ごとに **60 req/min**。

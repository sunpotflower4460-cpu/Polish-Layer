# 06. QC Gate ルール

> ⚠️ **LEGACY / Deprecated**: この文書は旧計画（アプリ MVP 実行者構想）に基づく仕様です。Polish Layer は現在「darake-dev-app-AI の素材工房バックエンド」へ方針転換しており、本文書の内容の大部分は darake-dev-app-AI 側の責務に移管されました。最新方針は `docs/00_workshop_master_plan.md` を参照してください。

## 概要

QC Gate は生成物が App Store Review Guidelines と Apple HIG、WCAG に準拠しているかを自動検査する。違反は重大度別に分類し、`error` は必ず差し戻し、`warning` は通知のみ。

## チェック項目

### アクセシビリティ

| ルール | 重大度 | 閾値 |
|---|---|---|
| カラーコントラスト比 | error | WCAG AA（通常4.5:1, 大文字3:1） |
| タップ領域 | error | 44×44pt 以上 |
| Dynamic Type 対応 | warning | フォントサイズ可変 |
| VoiceOver ラベル | warning | 主要操作要素にあるか |

### Apple HIG

| ルール | 重大度 |
|---|---|
| Safe Area 尊重 | error |
| Dark Mode 両対応 | error |
| ローディング状態UI | warning |
| 空状態（Empty State）UI | warning |
| エラー状態UI | warning |
| ハプティクス過剰使用 | warning |

### App Store 要件

| ルール | 重大度 |
|---|---|
| アプリアイコン全サイズ | error |
| 起動画像（Launch Screen） | error |
| プライバシー記述（Info.plist） | error |

### パフォーマンス

| ルール | 重大度 | 閾値 |
|---|---|---|
| バンドルサイズ | warning | 50MB 以下 |
| アニメーション総量 | warning | 過剰検知 |
| 60fps 維持 | warning | 静的解析で重い処理検知 |

### サウンド

| ルール | 重大度 | 閾値 |
|---|---|---|
| ラウドネス | error | -16 LUFS ±2 |
| クリッピング | error | 0 dBFS 未満 |

## 差し戻しフォーマット

```json
{
  "passed": false,
  "violations": [
    {
      "rule": "contrast_ratio",
      "severity": "error",
      "location": "LoginView.swift:42",
      "message": "primary (#0A84FF) on bg (#F5F5F5) の比率が 3.2:1 (要 4.5:1)",
      "suggestion": "primary を #0050B3 に変更すると 4.7:1"
    }
  ]
}
```

## 実装方針

- 静的解析可能なものはコード読み取り（regex / AST）
- カラーは Style Bible の値を直接検査
- アセットはメタデータと実ファイル両方を検査
- 重い検査（fps 等）は将来拡張

## 設計判断の記録

- **なぜ error と warning を分けるか**：すべてを error にすると生成が止まりすぎる。Apple審査必須項目だけ error、推奨レベルは warning。

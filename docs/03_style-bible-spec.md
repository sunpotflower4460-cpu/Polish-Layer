# 03. Style Bible 仕様

## 概要

Style Bible はプロジェクトごとのスタイル規定を表す JSON オブジェクト。プロジェクト開始時に生成・固定され、以降すべての生成物の基準となる。

機械可読なスキーマは `specs/style-bible.schema.json` を参照。

## 構造

```json
{
  "project_id": "string",
  "platform": "ios | android | both",
  "references": ["string"],
  "category": "productivity | social | finance | health | utility",
  "design_system": { ... },
  "motion": { ... },
  "sound": { ... },
  "copy": { ... },
  "qc_thresholds": { ... }
}
```

## フィールド詳細

### project_id

プロジェクト固有ID。UUID v4 推奨。

### platform

対象プラットフォーム。MVPでは `ios` のみサポート。

### references

参照タイトル配列（例：`["Linear", "Things 3", "Bear"]`）。VLM解析または手動キュレーションのインプット。

### category

カテゴリ。テンプレート選択とQC基準調整に使用。

### design_system

```json
{
  "color": {
    "mode": "auto | light | dark",
    "light": { "primary": "#hex", "bg": "#hex", "label": "#hex", "secondary_label": "#hex", "separator": "#hex" },
    "dark":  { "primary": "#hex", "bg": "#hex", "label": "#hex", "secondary_label": "#hex", "separator": "#hex" },
    "semantic": "iOS system colors準拠 等の説明"
  },
  "typography": {
    "family": "SF Pro | Inter | 他",
    "scale": "iOS Dynamic Type | Material Type Scale",
    "weights": [400, 500, 600, 700]
  },
  "spacing": {
    "base": 4,
    "scale": [4, 8, 12, 16, 24, 32, 48]
  },
  "corner_radius": {
    "card": 12,
    "button": 10,
    "sheet": 16
  },
  "elevation": "subtle | flat | strong"
}
```

### motion

```json
{
  "easing": "cubic-bezier(0.32, 0.72, 0, 1)",
  "duration": { "micro": 150, "standard": 250, "emphasized": 400 },
  "spring": { "stiffness": 300, "damping": 30 }
}
```

### sound

```json
{
  "enabled": true,
  "ui_se_set": "subtle_haptic_complement | rich | minimal",
  "loudness_target_lufs": -16
}
```

### copy

```json
{
  "tone": "friendly_professional | playful | formal",
  "person": "first | second | third",
  "locale": ["ja", "en"]
}
```

### qc_thresholds

```json
{
  "wcag": "AA | AAA",
  "min_tap_target_pt": 44,
  "max_bundle_mb": 50,
  "min_fps": 60
}
```

## 生成方法

### MVP

1. ユーザーが `category` と `references` を指定
2. `templates/style-bible/<category>.json` をベースに読み込み
3. `references` を `references` フィールドに記録（VLM解析は将来）
4. 固定して DB に保存

### 将来拡張

参照タイトルのスクショを VLM で解析し、色・タイポ・モーション特徴を自動抽出して Style Bible を生成。

## 不変性

一度確定した Style Bible は原則変更しない。変更する場合はバージョンを切る（v1, v2...）。理由：途中で基準が変わると生成物の一貫性が崩れるため。

## 設計判断の記録

- **なぜカテゴリ別テンプレートを持つか**：VLM 自動生成は精度が不安定なため、まず人間キュレーションで実用に足る基盤を作る。
- **なぜ JSON か**：エージェントが読み書きしやすく、スキーマ検証も容易。

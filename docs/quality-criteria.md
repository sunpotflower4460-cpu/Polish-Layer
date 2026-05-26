# 素材品質基準 (Quality Criteria)

このドキュメントは Polish Layer の棚に並べる素材の合否を判定するための基準書である。
AI エージェント（Copilot / Codex / Claude Code）および AI Vision 判定パイプラインは、
素材を curated / signature 棚に追加する前に必ず本ドキュメントを参照すること。

---

## 0. 共通原則

すべての素材は次の 3 条件を満たすこと:

1. **ライセンスが明確で商用利用可能**（MIT / Apache-2.0 / CC0 / CC-BY / SIL OFL 等）
2. **出典が信頼できる**（公式リポジトリ、公式 CDN、または一次配布元）
3. **企業レベルのアプリに使っても違和感がない**（Apple / Notion / Linear / Stripe 製品に並べて遜色ない）

1 つでも欠ければ **不合格**。判断に迷ったら `curated` ではなく `pending` 棚に置き、人間レビュー待ちとする。

**注**: 本書で列挙する SPDX 識別子（MIT / Apache-2.0 / CC0 / CC-BY / OFL / ISC）はドキュメント上の表記です（CC-BY はアニメーション/効果音基準で使用）。MCP 応答スキーマ（`LicenseInfoSchema`）上は `free-commercial` または `apple-system` に正規化されます。スキーマ拡張は別 PR で扱います。

---

## 1. アイコン品質基準

### 1.1 必須条件（すべて満たすこと）

| 項目 | 基準 |
|---|---|
| フォーマット | SVG（ベクター）であること。PNG のみは不可 |
| ViewBox | 24x24 / 20x20 / 16x16 のいずれかに正規化可能 |
| ストローク幅 | 同一セット内で統一されている（例: 全て 1.5px or 2px） |
| 塗り方式 | outline / filled / duotone のいずれかに分類できる |
| ライセンス | MIT / Apache-2.0 / CC0 / ISC のいずれか |
| 出典 | 公式リポジトリ or 公式 npm パッケージ |

**例外**: SF Symbols は Apple のシステムフォントとして名前ベース参照するため、1.1 の「フォーマット」条件における SVG 要件を免除します。スキーマ上は `license: apple-system` として扱います。

### 1.2 品質スコア（AI Vision で 0.0〜1.0 を判定）

- **0.9 以上 → signature 棚**: ピクセル整合、視覚的バランス完璧、Apple SF Symbols と並べても遜色なし
- **0.7〜0.89 → curated 棚**: 実用上問題なし、ただし signature ほどの洗練度はない
- **0.5〜0.69 → pending 棚**: 要人間レビュー
- **0.5 未満 → reject**: 棚に並べない

### 1.3 判定観点（AI Vision 用プロンプトに含めるべき項目）

1. **線の整合性**: ストローク幅が一貫しているか、半端なピクセルずれがないか
2. **視覚的重量**: 同セット内の他アイコンと比較して重さが揃っているか
3. **意味の明瞭さ**: アイコン名だけ見て意図が想像できるか（例: `settings` が歯車として描かれている）
4. **角の処理**: 角丸が統一されているか、鋭利な角が混在していないか
5. **余白**: viewBox 内の padding が他アイコンと揃っているか

### 1.4 推奨アイコンセット（最初に取り込む信頼ソース）

| セット | ライセンス | 推奨棚 | 備考 |
|---|---|---|---|
| Phosphor Icons | MIT | signature 候補 | 6 weights、整合性高い |
| Lucide | ISC | signature 候補 | Feather 後継、最も整合性が高い |
| Heroicons | MIT | signature 候補 | Tailwind 公式、Apple 寄り |
| Material Design Icons (mdi) | Apache-2.0 | curated | 数は多いが品質ばらつきあり |
| Tabler Icons | MIT | curated | 4500+、品質高め |
| Remix Icon | Apache-2.0 | curated | アジア圏で人気 |
| Bootstrap Icons | MIT | curated | Web 寄り |
| Feather Icons | MIT | curated（Lucide があれば不要） | 古いが安定 |

---

## 2. フォント品質基準

### 2.1 必須条件

| 項目 | 基準 |
|---|---|
| ライセンス | SIL Open Font License (OFL) または Apache-2.0 |
| 配布元 | Google Fonts / Fontsource / 公式リポジトリ |
| 字形カバレッジ | Latin + Latin Extended（日本語は別棚） |
| ウェイト | 最低 3 ウェイト（Regular / Medium / Bold）|
| ヒンティング | デジタル画面で滲まない |

### 2.2 棚分類

- **signature 棚（10〜20 フォント）**: 企業のフラッグシップ製品で実際に使われているフォント
  - 例: Inter, Manrope, IBM Plex Sans, Geist, Plus Jakarta Sans, Switzer 等
- **curated 棚（50〜100 フォント）**: 用途別の定番（Serif / Mono / Display / Handwriting）
- **all 棚**: Google Fonts 全体（接続経由のみ）

### 2.3 日本語フォント別棚

- signature: Noto Sans JP, M PLUS 1p, Zen Kaku Gothic New, BIZ UDPGothic
- curated: その他 OFL 日本語フォント

---

## 3. アニメーション品質基準（Lottie / useAnimations）

### 3.1 必須条件

| 項目 | 基準 |
|---|---|
| フォーマット | Lottie JSON (.json) または GIF/APNG（非推奨）|
| ファイルサイズ | 100KB 以下（signature）/ 500KB 以下（curated）|
| FPS | 30 or 60 |
| ループ可能性 | 明示されている（loop / one-shot）|
| ライセンス | MIT / CC0 / CC-BY |

### 3.2 品質観点

1. **動きの滑らかさ**: イージングが自然か
2. **目的の明瞭さ**: ローディング / 成功 / エラー / 通知 のどれかに分類できる
3. **サイズ感**: 24x24〜200x200 の範囲で破綻しない
4. **色のカスタマイズ性**: 単色置換が可能な構造か

---

## 4. 効果音 / BGM 品質基準

### 4.1 必須条件

| 項目 | 基準 |
|---|---|
| フォーマット | WAV / MP3 / OGG |
| サンプリングレート | 44.1kHz 以上 |
| ビット深度 | 16bit 以上 |
| ラウドネス | -16 LUFS ± 2（UI 効果音）|
| 長さ | UI 効果音は 2 秒以内 |
| ライセンス | CC0 / CC-BY |

### 4.2 棚分類

- signature: tap / success / error / notification / toggle の 5 種類 × 各 3 バリエーション
- curated: freesound からキュレーション

---

## 5. 画像 / イラスト品質基準

### 5.1 必須条件

| 項目 | 基準 |
|---|---|
| 解像度 | 最低 1920x1080（写真）/ SVG（イラスト）|
| ライセンス | Unsplash License / Pexels License / CC0 |
| モデルリリース | 人物写真は商用利用可能であること |

### 5.2 棚分類

- signature: unDraw, Storyset (Free) のイラスト
- curated: Unsplash / Pexels の厳選セット（カテゴリ別 50 枚ずつ）

---

## 6. 判定フロー（AI エージェント向け）

```
1. ソースから素材を取得
2. 上記 1〜5 の必須条件を機械的にチェック（フォーマット/ライセンス/サイズ）
   → 不合格なら reject ログに記録して終了
3. AI Vision で品質スコアを算出（0.0〜1.0）
4. スコアに応じて signature / curated / pending に振り分け
5. メタデータ JSON を生成（score, criteria_pass, license, source_url）
6. PR を作成し人間レビューに回す
```

---

## 7. 更新ポリシー

- 本基準は四半期ごとに見直す
- 新しい棚を追加するたびに該当セクションを追記
- 削除パターンが蓄積されたら `antipatterns.md` に反映し、ここから参照

---

## 8. 判定の二層構造

素材判定は以下の 2 層に分離して扱う。

### 8.1 Deterministic check（機械判定）

- ライセンス種別と出典 URL
- フォーマット（SVG/Lottie/WAV 等）
- サイズ・解像度・再生時間・LUFS 等の数値条件
- 必須メタデータ（`source_url` / ライセンス / カテゴリ情報）の充足

### 8.2 AI / Human judgment（審美判定）

- 視覚的重量の一貫性
- 動き・音の自然さ
- 意味の明瞭さ
- 企業レベル感（過剰演出の有無、実運用への適合）

Deterministic check を満たさない素材は即 reject。機械判定を通過した素材のみ AI / 人間判断に進め、迷う場合は pending に送る。

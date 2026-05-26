# 05. Connectors 仕様

## 共通インターフェース

すべての Connector は以下を実装する。

```typescript
interface Connector<TQuery, TResult> {
  name: string;
  search(query: TQuery): Promise<TResult[]>;
  normalize(raw: unknown): TResult;
  getLicenseInfo(item: TResult): LicenseInfo;
}

interface LicenseInfo {
  type: 'CC0' | 'MIT' | 'Apache-2.0' | 'free-commercial' | 'paid' | 'apple-system' | 'restricted';
  attribution_required: boolean;
  commercial_use: boolean;
  source_url: string;
}
```

## 接続するAPI（MVP）

### UI コンポーネント参照

| ソース | API | 認証 | ライセンス |
|---|---|---|---|
| Figma Community | Figma API | トークン | 各ファイル依存 |
| shadcn/ui | GitHub | 不要 | MIT |
| Tailwind UI | 静的取得 | 有料 | 有料ライセンス |

### アイコン

| ソース | 認証 | 備考 |
|---|---|---|
| SF Symbols | 不要（ローカル同梱） | iOS純正の質感を出す本命 |
| Iconify | 不要 | 150万点統合 |
| Lucide | 不要 | 補完用 |
| Phosphor | 不要 | 補完用 |

### フォント

| ソース | 認証 |
|---|---|
| Google Fonts API | APIキー |
| Apple System Fonts | ガイドのみ |

### アニメーション

| ソース | 認証 |
|---|---|
| LottieFiles | APIキー |
| Rive | APIキー（将来） |

### サウンド

| ソース | 認証 |
|---|---|
| freesound | APIキー |
| ElevenLabs（SE生成） | APIキー |
| Epidemic Sound（BGM） | 契約 |

### コピー / i18n

| ソース | 認証 |
|---|---|
| DeepL API | APIキー |
| OpenAI API | APIキー |

## 実装順序（Phase 2）

外部認証不要なものから順に：

1. SF Symbols（ローカルJSON同梱）
2. Iconify（無認証）
3. Google Fonts（無料APIキー）
4. LottieFiles
5. freesound

## ライセンス取り扱いルール

- 商用利用不可のアセットは検索結果に含めない（フィルタ）。
- 結果には必ず `license` フィールドを付与。
- 帰属表示が必要なアセットは `attribution_required: true` を立て、エージェントが credit ファイルを生成できるようにする。

## 設計判断の記録

- **なぜ SF Symbols を最優先か**：iOS純正の手触りが圧倒的で、これ1つで「らしさ」が出る。
- **なぜ Iconify を採用するか**：150万点をひとつの API で扱える集約効果が大きい。

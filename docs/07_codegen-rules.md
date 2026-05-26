# 07. コード生成規約

## 概要

`polish.get_screen` が返すコード片は以下の規約に従う。エージェントがそのまま組み込んでもプロジェクトが破綻しない品質を保つ。

## 共通ルール

- 1ファイル1コンポーネント
- import 文は完全に揃える（部分省略禁止）
- Style Bible の値は変数参照（直書き禁止）
- アクセシビリティ属性を必ず付与
- Dark Mode 対応コードを必ず含める

## SwiftUI 規約

### ファイル構成

```swift
import SwiftUI

struct LoginView: View {
    // MARK: - Properties
    @State private var email: String = ""
    @State private var password: String = ""

    // MARK: - Body
    var body: some View {
        // ...
    }
}

// MARK: - Preview
#Preview {
    LoginView()
}
```

### カラー参照

```swift
// NG
.foregroundStyle(Color(hex: "#0A84FF"))

// OK
.foregroundStyle(.primaryAccent) // Style Bible 由来の Asset Catalog
```

### スペーシング

```swift
// NG
.padding(16)

// OK
.padding(StyleBible.spacing.md) // 16pt = spacing scale の md
```

### アクセシビリティ

```swift
Button(action: onSubmit) {
    Text("ログイン")
}
.accessibilityLabel("ログインボタン")
.accessibilityHint("タップするとログインします")
```

### モーション

```swift
withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
    isVisible.toggle()
}
// duration / easing は Style Bible の motion フィールドから取得
```

## React Native 規約

### ファイル構成

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useStyleBible } from './style-bible';

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const sb = useStyleBible();

  return (
    <View style={[styles.container, { backgroundColor: sb.color.bg }]}>
      {/* ... */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### ジェネレータの責務（RN）

`polish.get_screen` は画面コンポーネントだけでなく、**Style Bible 参照用の最小モジュール（`style-bible.ts`）も同じディレクトリに同時 emit する**。これにより消費者プロジェクトが path alias（`@/...`）を設定していなくても動作する。

emit 構成例：

```
generated/
├── LoginScreen.tsx
└── style-bible.ts
```

エイリアス導入は消費者プロジェクト側の任意設定であり、Polish Layer の生成物はそれに依存しない。

### カラー参照

```typescript
// NG
color: '#0A84FF'

// OK
color: sb.color.primary
```

### アクセシビリティ

```typescript
<Pressable
  onPress={onSubmit}
  accessible={true}
  accessibilityLabel='ログインボタン'
  accessibilityRole='button'
>
```

## 出力フォーマット

`polish.get_screen` の `code` フィールドは以下のメタデータを先頭コメントに含める。

```swift
// polish-layer: generated
// style-bible-version: v1
// qc-passed: true
// generated-at: 2024-01-01T00:00:00Z
```

## 設計判断の記録

- **なぜ Style Bible 値の直書きを禁止するか**：Style Bible が更新されたとき、一括置換が可能になる。直書きすると追跡不能な差異が生まれる。
- **なぜアクセシビリティ属性を必須にするか**：App Store審査でリジェクトリスクを下げるため、また QC Gate の VoiceOver ルールをパスするため。

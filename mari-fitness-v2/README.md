# マリフィットネス (MARI FITNESS)

AIフィットネスコーチ「子虎マリ」と一緒に、トレーニング・体重・食事を管理する Expo アプリです。

## 技術スタック

- Expo SDK 57
- React Native 0.86
- TypeScript
- AsyncStorage（ローカルデータ保存）

## 必要環境

- Node.js 22.13 以上（推奨: 24.x）
- npm

## セットアップ

```bash
npm install
```

### 環境変数（任意）

OpenAI API を使う場合は `.env.example` を参考に `.env` を作成します。

```bash
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

未設定の場合は、組み込みのルールベース AI が動作します。

## 開発サーバー起動

```bash
npm start
```

- **Web**: `npm run web`
- **Android**: `npm run android`
- **iOS**: `npm run ios`

## 型チェック

```bash
npm run typecheck
```

## Web ビルド（Expo Export）

```bash
npm run export:web
```

出力先: `dist/`

全プラットフォーム向け:

```bash
npm run export
```

## ネイティブビルド（EAS Build）

初回のみ [Expo アカウント](https://expo.dev) でログインし、プロジェクトをリンクします。

```bash
npx eas login
npx eas init
```

### ビルドコマンド

| プロファイル | 用途 | コマンド |
|-------------|------|---------|
| development | 開発クライアント | `npx eas build --profile development --platform android` |
| preview | 内部テスト用 APK 等 | `npx eas build --profile preview --platform android` |
| production | ストア公開用 | `npx eas build --profile production --platform all` |

### ストア提出

```bash
npx eas submit --platform ios
npx eas submit --platform android
```

## アセット

| ファイル | 用途 |
|---------|------|
| `assets/icon.png` | アプリアイコン |
| `assets/splash-icon.png` | スプラッシュ画面 |
| `assets/mari-avatar.png` | 子虎マリのアバター（任意・未配置時は 🐯 プレースホルダー） |

子虎マリの画像を追加する場合は `assets/mari-avatar.png` を配置し、`MariAvatar` の `source` に渡してください。

## 主な機能

- ホーム — 今日のサマリー・各機能への導線
- トレーニング — 曜日別メニュー・進捗管理
- 体重管理 — 記録・推移グラフ
- 食事管理 — カロリー・タンパク質記録
- AIマリ — フィットネス相談チャット
- 設定 — プロフィール・目標値・データ管理

## ライセンス

Private

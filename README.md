# mari-workout

MARI FITNESS（マリフィットネス）の Git リポジトリです。

## 実行基盤

**現在の実行基盤は `cursor/mari-trainer-avatar`（commit `a606874`）系をベースとします。**  
アプリ本体は [`mari-fitness-v2/`](./mari-fitness-v2/) にあります。

- Expo SDK 57 / React Native 0.86
- 開発手順の詳細は [`mari-fitness-v2/README.md`](./mari-fitness-v2/README.md) を参照してください

## master 固有資産の扱い

`origin/master`（`a8a78f3`）にのみ存在した重要資産は、現行実装を上書きせず **legacy / archive として保管**しています。

| 保管先 | 内容 |
|--------|------|
| `mari-fitness-v2/assets/legacy/master-avatars/` | 旧アバター PNG 6点 |
| `mari-fitness-v2/docs/AVATAR_INTEGRATION.md` | アバター統合・成長システムのメモ |
| `mari-fitness-v2/archive/storage.zip` | master 由来の zip |
| `mari-fitness-v2/archive/claude-settings.json` | master の `.claude/settings.json` のコピー |

これらは参照・将来計画用です。現行の avatar require・音楽・UI・EAS 設定へは混ぜません。

## バックアップタグ

- `backup/cursor-a606874`
- `backup/master-a8a78f3`

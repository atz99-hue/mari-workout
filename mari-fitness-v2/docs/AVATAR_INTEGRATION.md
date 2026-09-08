# MARI FITNESS Avatar Integration

## Confirmed character set
- 女性ユーザーアバター: `assets/avatars/female-user-avatar.png`
- 男性ユーザーアバター: `assets/avatars/male-user-avatar.png`
- 小虎マリトレーナー: `assets/avatars/mari-trainer-avatar.png`

The three avatar images were cropped from the confirmed MARI FITNESS character lineup supplied by the project owner.

## Implemented
- Added `AvatarGender` to `AppSettings` with `female` as the default.
- Added `UserAvatar` component.
- Home screen shows the selected user avatar next to the user's name.
- Settings screen lets the user choose 女性ユーザー / 男性ユーザー.
- AI Mari chat now uses the confirmed 小虎マリ image instead of the 🐯 placeholder.
- Storage version bumped to 5; existing saved data remains compatible because settings are merged with defaults during migration.
- Web build was re-exported successfully after the avatar changes.

## Next development stage
The current integration is the foundation for the full avatar growth system. The next step can add level-based full-body artwork (Lv.1 / Lv.10 / Lv.30 / Lv.50), EXP, growth unlocks, expressions, and outfit customization while keeping these three base characters fixed.

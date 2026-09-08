import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_ENABLED = "mariFitnessMusicEnabled";
const KEY_VOLUME = "mariFitnessMusicVolume";

export type MusicSettings = {
  enabled: boolean;
  /** 0〜100 */
  volume: number;
};

export const DEFAULT_MUSIC_SETTINGS: MusicSettings = {
  enabled: true,
  volume: 40,
};

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MUSIC_SETTINGS.volume;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function loadMusicSettings(): Promise<MusicSettings> {
  try {
    const [enabledRaw, volumeRaw] = await Promise.all([
      AsyncStorage.getItem(KEY_ENABLED),
      AsyncStorage.getItem(KEY_VOLUME),
    ]);

    if (enabledRaw === null && volumeRaw === null) {
      return { ...DEFAULT_MUSIC_SETTINGS };
    }

    return {
      enabled: enabledRaw === null ? DEFAULT_MUSIC_SETTINGS.enabled : enabledRaw === "true",
      volume:
        volumeRaw === null
          ? DEFAULT_MUSIC_SETTINGS.volume
          : clampVolume(parseFloat(volumeRaw)),
    };
  } catch {
    return { ...DEFAULT_MUSIC_SETTINGS };
  }
}

export async function saveMusicSettings(settings: MusicSettings): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEY_ENABLED, String(settings.enabled)),
    AsyncStorage.setItem(KEY_VOLUME, String(clampVolume(settings.volume))),
  ]);
}

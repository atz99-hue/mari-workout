import { useCallback, useEffect, useState } from "react";
import { musicManager } from "../services/musicManager";
import {
  DEFAULT_MUSIC_SETTINGS,
  loadMusicSettings,
  MusicSettings,
  saveMusicSettings,
} from "../storage/musicSettings";

export function useMusicSettings() {
  const [settings, setSettings] = useState<MusicSettings>(DEFAULT_MUSIC_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadMusicSettings().then((loadedSettings) => {
      if (!active) return;
      setSettings(loadedSettings);
      setLoaded(true);
      musicManager.markSettingsLoaded(loadedSettings);
    });

    return () => {
      active = false;
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<MusicSettings>) => {
    setSettings((prev) => {
      const next: MusicSettings = {
        enabled: partial.enabled ?? prev.enabled,
        volume: partial.volume ?? prev.volume,
      };
      void saveMusicSettings(next);
      musicManager.applySettings(next);
      return next;
    });
  }, []);

  return { settings, loaded, updateSettings };
}

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { AppStateStatus } from "react-native";
import { IN_APP_BGM_SOURCE } from "../constants/inAppBgm";
import { MusicCueId, MUSIC_TRACKS, resolveMusicCue } from "../constants/musicTracks";
import { DEFAULT_MUSIC_SETTINGS, MusicSettings } from "../storage/musicSettings";
import { addPlaybackStatusListener } from "./audioPlayerCompat";

const FADE_STEP_MS = 50;
/** アプリ内BGMは設定音量の100%（オープニング音量は変更しない） */
const BGM_VOLUME_RATIO = 1.00;
/** PR / トレーニング開始キュー中は BGM をさらに下げる */
const BGM_DUCK_RATIO = 0.2;

type PlayCueOptions = {
  dedupeKey?: string;
  dedupeMs?: number;
  randomIndex?: number;
};

type OpeningPlaybackCallbacks = {
  onFinished?: () => void;
  onProgress?: (currentSec: number, durationSec: number) => void;
};

class MusicManager {
  private player: AudioPlayer | null = null;
  private bgmPlayer: AudioPlayer | null = null;
  private settings: MusicSettings = { ...DEFAULT_MUSIC_SETTINGS };
  private settingsLoaded = false;
  private audioModeReady = false;
  private playToken = 0;
  private openingToken = 0;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private bgmFadeInterval: ReturnType<typeof setInterval> | null = null;
  private stopTimeout: ReturnType<typeof setTimeout> | null = null;
  private statusListener: { remove: () => void } | null = null;
  private appInBackground = false;
  private dedupeMap = new Map<string, number>();
  private activeFadeOutMs = 800;
  private isOpeningPlaying = false;
  private openingCallbacks: OpeningPlaybackCallbacks | null = null;
  /** オープニング終了後に BGM を回したい */
  private bgmWanted = false;
  private bgmDucked = false;
  /** 一度でも再生を始めたら、再開時に seekTo(0) しない */
  private bgmHasStarted = false;

  async initialize(settings?: MusicSettings): Promise<void> {
    if (settings) {
      this.settings = settings;
      this.settingsLoaded = true;
    }

    if (!this.audioModeReady) {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "mixWithOthers",
          allowsRecording: false,
        });
        this.audioModeReady = true;
      } catch (error) {
        console.warn("[MusicManager] setAudioModeAsync failed:", error);
      }
    }

    if (this.canPlay()) {
      await this.preloadThemeTrack();
      this.ensureBgmPlayer();
    }
  }

  private async preloadThemeTrack(): Promise<void> {
    const player = this.ensurePlayer("mari_fitness_theme");
    if (!player) return;
    await this.waitForPlayerLoaded(player);
  }

  private waitForPlayerLoaded(player: AudioPlayer, timeoutMs = 20000): Promise<boolean> {
    if (player.isLoaded) return Promise.resolve(true);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (loaded: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        subscription?.remove();
        resolve(loaded);
      };

      const timeout = setTimeout(() => finish(false), timeoutMs);
      const subscription = addPlaybackStatusListener(player, (status) => {
        if (status.isLoaded) finish(true);
      });

      if (player.isLoaded) finish(true);
    });
  }

  applySettings(settings: MusicSettings): void {
    this.settings = settings;
    this.settingsLoaded = true;

    if (!settings.enabled) {
      this.cancelOpening();
      void this.stop(false);
      this.pauseBgm();
      return;
    }

    if (this.player?.playing && !this.isOpeningPlaying) {
      this.player.volume = this.getEffectiveVolume();
    }
    this.applyBgmVolume();
    if (this.bgmWanted && !this.isOpeningPlaying) {
      void this.startBgmLoop();
    }
  }

  markSettingsLoaded(settings: MusicSettings): void {
    this.settings = settings;
    this.settingsLoaded = true;
  }

  isReady(): boolean {
    return this.settingsLoaded;
  }

  isEnabled(): boolean {
    return this.settings.enabled;
  }

  isOpeningActive(): boolean {
    return this.isOpeningPlaying;
  }

  private getEffectiveVolume(): number {
    return Math.max(0, Math.min(1, this.settings.volume / 100));
  }

  private getBgmTargetVolume(): number {
    const base = this.getEffectiveVolume() * BGM_VOLUME_RATIO;
    return Math.max(0, Math.min(1, this.bgmDucked ? base * BGM_DUCK_RATIO : base));
  }

  private canPlay(): boolean {
    return this.settingsLoaded && this.settings.enabled && !this.appInBackground;
  }

  private clearTimers(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
  }

  private clearStatusListener(): void {
    this.statusListener?.remove();
    this.statusListener = null;
  }

  private ensurePlayer(trackId: keyof typeof MUSIC_TRACKS): AudioPlayer | null {
    try {
      if (!this.player) {
        this.player = createAudioPlayer(MUSIC_TRACKS[trackId].source, {
          downloadFirst: true,
        });
      }
      return this.player;
    } catch (error) {
      console.warn("[MusicManager] Failed to create player:", error);
      return null;
    }
  }

  private ensureBgmPlayer(): AudioPlayer | null {
    if (IN_APP_BGM_SOURCE == null) {
      return null;
    }

    try {
      if (!this.bgmPlayer) {
        this.bgmPlayer = createAudioPlayer(IN_APP_BGM_SOURCE, {
          downloadFirst: true,
        });
        this.bgmPlayer.loop = true;
      }
      return this.bgmPlayer;
    } catch (error) {
      console.warn("[MusicManager] Failed to create BGM player:", error);
      return null;
    }
  }

  /** オープニング終了後のアプリ内BGM。オープニング再生仕様は変えない */
  async startBgmLoop(): Promise<void> {
    this.bgmWanted = true;
    if (!this.canPlay() || this.isOpeningPlaying) return;

    try {
      const player = this.ensureBgmPlayer();
      if (!player) return;
      const loaded = await this.waitForPlayerLoaded(player);
      if (!loaded || !this.canPlay() || this.isOpeningPlaying) return;

      player.loop = true;
      if (!player.playing) {
        if (!this.bgmHasStarted) {
          await player.seekTo(0);
          this.bgmHasStarted = true;
        }
        player.volume = this.getBgmTargetVolume();
        player.play();
      } else {
        player.volume = this.getBgmTargetVolume();
      }
    } catch (error) {
      console.warn("[MusicManager] startBgmLoop failed:", error);
    }
  }

  private pauseBgm(): void {
    const player = this.bgmPlayer;
    if (!player) return;
    try {
      if (player.playing) player.pause();
      player.volume = 0;
    } catch {
      // ignore
    }
  }

  private applyBgmVolume(): void {
    const player = this.bgmPlayer;
    if (player?.playing) {
      player.volume = this.getBgmTargetVolume();
    }
  }

  private async setBgmDucked(ducked: boolean): Promise<void> {
    this.bgmDucked = ducked;
    const player = this.bgmPlayer;
    if (!player?.playing) return;
    const to = this.getBgmTargetVolume();
    await this.fadeBgmVolume(player, player.volume, to, ducked ? 180 : 400);
  }

  /** オープニング: タップスキップ時に短いフェードアウトで停止（二重再生防止） */
  async skipOpeningFadeOut(fadeOutMs = 400): Promise<void> {
    this.openingToken++;
    this.isOpeningPlaying = false;
    this.openingCallbacks = null;
    this.clearStatusListener();

    const player = this.player;
    if (!player?.playing) {
      if (player) {
        try {
          player.pause();
          await player.seekTo(0);
          player.volume = 0;
        } catch {
          // ignore cleanup errors
        }
      }
      return;
    }

    try {
      await this.fadeVolume(player, player.volume, 0, fadeOutMs);
      player.pause();
      await player.seekTo(0);
      player.volume = 0;
    } catch (error) {
      console.warn("[MusicManager] skipOpeningFadeOut failed:", error);
      try {
        player.pause();
        await player.seekTo(0);
        player.volume = 0;
      } catch {
        // ignore cleanup errors
      }
    }
  }

  /** オープニング: テーマ曲を最初から最後までフル再生（フェードなし） */
  async playOpeningFull(callbacks?: OpeningPlaybackCallbacks): Promise<void> {
    this.cancelOpening();

    if (!this.canPlay()) {
      callbacks?.onFinished?.();
      return;
    }

    const token = ++this.openingToken;
    this.isOpeningPlaying = true;
    this.openingCallbacks = callbacks ?? null;
    this.clearTimers();

    try {
      const player = this.ensurePlayer("mari_fitness_theme");
      if (!player || token !== this.openingToken) return;

      const loaded = await this.waitForPlayerLoaded(player);
      if (!loaded || token !== this.openingToken) {
        this.finishOpening(false);
        return;
      }

      player.pause();
      await player.seekTo(0);
      player.volume = this.getEffectiveVolume();
      player.play();

      this.statusListener = addPlaybackStatusListener(player, (status) => {
        if (token !== this.openingToken) return;

        if (status.duration > 0 && this.openingCallbacks?.onProgress) {
          this.openingCallbacks.onProgress(status.currentTime, status.duration);
        }

        if (status.didJustFinish) {
          this.finishOpening(true);
        }
      });
    } catch (error) {
      console.warn("[MusicManager] playOpeningFull failed:", error);
      this.finishOpening(false);
    }
  }

  private finishOpening(_success: boolean): void {
    if (!this.isOpeningPlaying) return;

    this.isOpeningPlaying = false;
    this.clearStatusListener();

    const player = this.player;
    if (player?.playing) {
      player.pause();
    }

    const callbacks = this.openingCallbacks;
    this.openingCallbacks = null;
    callbacks?.onFinished?.();
  }

  cancelOpening(): void {
    this.openingToken++;
    this.isOpeningPlaying = false;
    this.openingCallbacks = null;
    this.clearStatusListener();

    const player = this.player;
    if (player?.playing) {
      player.pause();
    }
  }

  async releaseAfterOpening(): Promise<void> {
    this.cancelOpening();
    const player = this.player;
    if (!player) return;

    try {
      player.pause();
      await player.seekTo(0);
      player.volume = 0;
    } catch (error) {
      console.warn("[MusicManager] releaseAfterOpening failed:", error);
    }
  }

  async playCue(cueId: MusicCueId, options?: PlayCueOptions): Promise<void> {
    if (!this.canPlay()) return;

    this.cancelOpening();

    if (options?.dedupeKey) {
      const last = this.dedupeMap.get(options.dedupeKey) ?? 0;
      const dedupeMs = options.dedupeMs ?? 3000;
      if (Date.now() - last < dedupeMs) return;
      this.dedupeMap.set(options.dedupeKey, Date.now());
    }

    const cue = resolveMusicCue(cueId, options?.randomIndex);
    const token = ++this.playToken;
    this.clearTimers();
    this.activeFadeOutMs = cue.fadeOutMs;
    void this.setBgmDucked(true);

    try {
      const player = this.ensurePlayer(cue.trackId);
      if (!player || token !== this.playToken) {
        if (token === this.playToken) void this.setBgmDucked(false);
        return;
      }

      const loaded = await this.waitForPlayerLoaded(player);
      if (!loaded || token !== this.playToken) {
        console.warn("[MusicManager] Theme track not loaded in time:", cueId);
        if (token === this.playToken) void this.setBgmDucked(false);
        return;
      }

      await player.seekTo(cue.startSec);
      player.volume = 0;
      player.play();

      await this.fadeVolume(player, 0, this.getEffectiveVolume(), cue.fadeInMs, token);
      if (token !== this.playToken) return;

      this.stopTimeout = setTimeout(() => {
        void this.stop(true, token);
      }, cue.durationSec * 1000);
    } catch (error) {
      console.warn("[MusicManager] playCue failed:", cueId, error);
      if (token === this.playToken) void this.setBgmDucked(false);
    }
  }

  async stop(fadeOut = true, token?: number): Promise<void> {
    if (token !== undefined && token !== this.playToken) return;

    this.clearTimers();
    const player = this.player;
    if (!player) {
      if (token === undefined || token === this.playToken) {
        void this.setBgmDucked(false);
      }
      return;
    }

    try {
      if (fadeOut && player.playing) {
        await this.fadeVolume(player, player.volume, 0, this.activeFadeOutMs);
      }
      player.pause();
      await player.seekTo(0);
      player.volume = 0;
      if (token === this.playToken) {
        void this.setBgmDucked(false);
      }
    } catch (error) {
      console.warn("[MusicManager] stop failed:", error);
    }
  }

  handleAppStateChange(nextState: AppStateStatus): void {
    const background = nextState === "background" || nextState === "inactive";
    this.appInBackground = background;
    if (background) {
      this.playToken++;
      this.cancelOpening();
      void this.stop(false);
      this.pauseBgm();
      return;
    }
    if (this.bgmWanted && this.settings.enabled && !this.isOpeningPlaying) {
      void this.startBgmLoop();
    }
  }

  destroy(): void {
    this.playToken++;
    this.cancelOpening();
    this.clearTimers();
    this.bgmWanted = false;
    this.bgmHasStarted = false;
    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval);
      this.bgmFadeInterval = null;
    }
    if (this.bgmPlayer) {
      try {
        this.bgmPlayer.remove();
      } catch {
        // ignore cleanup errors
      }
      this.bgmPlayer = null;
    }
    if (this.player) {
      try {
        this.player.remove();
      } catch {
        // ignore cleanup errors
      }
      this.player = null;
    }
  }

  private fadeVolume(
    player: AudioPlayer,
    from: number,
    to: number,
    durationMs: number,
    token?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (durationMs <= 0) {
        player.volume = to;
        resolve();
        return;
      }

      const steps = Math.max(1, Math.ceil(durationMs / FADE_STEP_MS));
      const delta = (to - from) / steps;
      let current = from;
      let step = 0;

      this.fadeInterval = setInterval(() => {
        if (token !== undefined && token !== this.playToken) {
          if (this.fadeInterval) clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          resolve();
          return;
        }

        step += 1;
        current += delta;
        player.volume = step >= steps ? to : current;

        if (step >= steps) {
          if (this.fadeInterval) clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          resolve();
        }
      }, FADE_STEP_MS);
    });
  }

  private fadeBgmVolume(
    player: AudioPlayer,
    from: number,
    to: number,
    durationMs: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.bgmFadeInterval) {
        clearInterval(this.bgmFadeInterval);
        this.bgmFadeInterval = null;
      }
      if (durationMs <= 0) {
        player.volume = to;
        resolve();
        return;
      }

      const steps = Math.max(1, Math.ceil(durationMs / FADE_STEP_MS));
      const delta = (to - from) / steps;
      let current = from;
      let step = 0;

      this.bgmFadeInterval = setInterval(() => {
        step += 1;
        current += delta;
        player.volume = step >= steps ? to : current;

        if (step >= steps) {
          if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
          this.bgmFadeInterval = null;
          resolve();
        }
      }, FADE_STEP_MS);
    });
  }
}

export const musicManager = new MusicManager();

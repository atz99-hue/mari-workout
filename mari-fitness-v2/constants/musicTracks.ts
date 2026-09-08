export type MusicTrackId = "mari_fitness_theme";

export type MusicCueId = "opening" | "training_start" | "pr_celebration" | "full";

export type MusicCue = {
  id: MusicCueId;
  trackId: MusicTrackId;
  /** 再生開始位置（秒） */
  startSec: number;
  /** 再生尺（秒） */
  durationSec: number;
  fadeInMs: number;
  fadeOutMs: number;
};

export type MusicTrack = {
  id: MusicTrackId;
  title: string;
  source: number;
};

/** 将来のランダム再生用: 同一用途に複数キューを割り当て可能 */
export type MusicCueGroup = {
  id: MusicCueId;
  cues: MusicCue[];
};

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrack> = {
  mari_fitness_theme: {
    id: "mari_fitness_theme",
    title: "一歩先の自分へ",
    source: require("../assets/audio/mari_fitness_theme.mp3"),
  },
};

export const MUSIC_CUE_GROUPS: Record<MusicCueId, MusicCueGroup> = {
  opening: {
    id: "opening",
    cues: [
      {
        id: "opening",
        trackId: "mari_fitness_theme",
        startSec: 0,
        durationSec: 0,
        fadeInMs: 0,
        fadeOutMs: 0,
      },
    ],
  },
  training_start: {
    id: "training_start",
    cues: [
      {
        id: "training_start",
        trackId: "mari_fitness_theme",
        startSec: 45,
        durationSec: 15,
        fadeInMs: 600,
        fadeOutMs: 800,
      },
    ],
  },
  pr_celebration: {
    id: "pr_celebration",
    cues: [
      {
        id: "pr_celebration",
        trackId: "mari_fitness_theme",
        startSec: 75,
        durationSec: 8,
        fadeInMs: 500,
        fadeOutMs: 800,
      },
    ],
  },
  full: {
    id: "full",
    cues: [
      {
        id: "full",
        trackId: "mari_fitness_theme",
        startSec: 0,
        durationSec: 600,
        fadeInMs: 1000,
        fadeOutMs: 1000,
      },
    ],
  },
};

export function resolveMusicCue(cueId: MusicCueId, randomIndex?: number): MusicCue {
  const group = MUSIC_CUE_GROUPS[cueId];
  if (group.cues.length === 1) return group.cues[0];
  const index =
    randomIndex !== undefined
      ? randomIndex % group.cues.length
      : Math.floor(Math.random() * group.cues.length);
  return group.cues[index];
}

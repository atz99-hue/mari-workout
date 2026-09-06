import { type AudioPlayer, type AudioStatus } from "expo-audio";

type PlaybackStatusSubscription = { remove: () => void };

/**
 * SDK 57 互換: AudioPlayer 型が SharedObject.addListener を公開しない。
 * 実行時の再生挙動は変えない。
 */
export function addPlaybackStatusListener(
  player: AudioPlayer,
  listener: (status: AudioStatus) => void
): PlaybackStatusSubscription {
  return (
    player as AudioPlayer & {
      addListener: (
        eventName: "playbackStatusUpdate",
        cb: (status: AudioStatus) => void
      ) => PlaybackStatusSubscription;
    }
  ).addListener("playbackStatusUpdate", listener);
}

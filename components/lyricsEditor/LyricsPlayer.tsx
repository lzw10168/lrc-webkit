import { Copy, SkipBack, SkipForward, Play, Pause, Rewind, FastForward, Plus, Minus } from 'lucide-react';
import { AudioTrack } from './types';
import { useTranslations } from 'next-intl';

interface LyricsPlayerProps {
  playlist: AudioTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  progressBarRef: React.RefObject<HTMLDivElement>;
  copyCurrentTime: () => void;
  playPreviousTrack: () => void;
  playNextTrack: () => void;
  adjustTime: (seconds: number) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  handleProgressBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}]`;
};

const LyricsPlayer = ({
  playlist,
  currentTrackIndex,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  progressBarRef,
  copyCurrentTime,
  playPreviousTrack,
  playNextTrack,
  adjustTime,
  togglePlayPause,
  setPlaybackRate,
  handleProgressBarClick,
}: LyricsPlayerProps) => {
  const t = useTranslations('Editor');

  return (
    <div className="bg-card p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium truncate max-w-[70%]">
          {currentTrackIndex >= 0 && playlist.length > 0
            ? playlist[currentTrackIndex].name
            : t('player.noAudioSelected')}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('player.speed')}</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="text-sm bg-muted p-1 rounded"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={copyCurrentTime}
            className="p-2 rounded-full hover:bg-muted"
            title={t('player.copyCurrentTime')}
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <div>{formatTime(currentTime)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      <div
        ref={progressBarRef}
        className="w-full bg-muted h-2 rounded-full mb-4 cursor-pointer"
        onClick={handleProgressBarClick}
      >
        <div
          className="bg-primary h-2 rounded-full"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        ></div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={playPreviousTrack}
          disabled={currentTrackIndex <= 0}
          className="p-2 rounded-full hover:bg-muted disabled:opacity-50"
          title={t('player.previousTrack')}
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={() => adjustTime(-5)}
          className="p-2 rounded-full hover:bg-muted"
          title={t('player.rewind')}
        >
          <Rewind size={20} />
        </button>

        <button
          onClick={togglePlayPause}
          disabled={currentTrackIndex < 0}
          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          title={t('player.playPause')}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={() => adjustTime(5)}
          className="p-2 rounded-full hover:bg-muted"
          title={t('player.forward')}
        >
          <FastForward size={20} />
        </button>

        <button
          onClick={playNextTrack}
          disabled={currentTrackIndex >= playlist.length - 1}
          className="p-2 rounded-full hover:bg-muted disabled:opacity-50"
          title={t('player.nextTrack')}
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default LyricsPlayer;

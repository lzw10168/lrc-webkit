import { AudioTrack } from './types';
import { useTranslations } from 'next-intl';

interface PlayListProps {
  playlist: AudioTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  setCurrentTrackIndex: (index: number) => void;
}

const PlayList = ({
  playlist,
  currentTrackIndex,
  isPlaying,
  setCurrentTrackIndex
}: PlayListProps) => {
  const t = useTranslations('Editor');

  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">{t('playlist.title')}</h2>
      {playlist.length === 0 ? (
        <p className="text-muted-foreground">{t('playlist.noAudioFiles')}</p>
      ) : (
        <ul className="divide-y divide-border overflow-y-auto max-h-[calc(100vh-600px)] scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted scrollbar-thumb-rounded-md">
          {playlist.map((track, index) => (
            <li
              key={track.id}
              className={`py-2 px-2 cursor-pointer hover:bg-muted rounded-md ${index === currentTrackIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
              onClick={() => setCurrentTrackIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="truncate">{track.name}</span>
                  {track.lyricsText && (
                    <span className="text-xs text-primary">{t('playlist.lyricsMatched')}</span>
                  )}
                </div>
                {index === currentTrackIndex && isPlaying && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayList; 

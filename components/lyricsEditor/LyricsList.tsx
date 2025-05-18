import { Edit, AlertCircle } from 'lucide-react';
import { LyricsLine } from './types';
import { useTranslations } from 'next-intl';

interface LyricsListProps {
  lineTimeOffset: number;
  setLineTimeOffset: (value: number) => void;
  parsedLyrics: LyricsLine[];
  selectedLineIndex: number;
  jumpToLyricLine: (index: number) => void;
  adjustLineTimestamp: (index: number, offset: number) => void;
  updateLineTimestamp: (index: number) => void;
}

const LyricsList = ({
  lineTimeOffset,
  setLineTimeOffset,
  parsedLyrics,
  selectedLineIndex,
  jumpToLyricLine,
  adjustLineTimestamp,
  updateLineTimestamp,
}: LyricsListProps) => {
  const t = useTranslations('Editor');

  return (
    <div >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t('lyricsLine')}</h2>
          <div className="relative group">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-muted-foreground cursor-help" />
              <span className="text-xs text-muted-foreground">{t('shortcuts')}</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-4 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <p className="mb-1">{t('shortcutTips.title')}</p>
              <ul className="space-y-1">
                <li>• {t('shortcutTips.space')}</li>
                <li>• {t('shortcutTips.arrows')}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground mr-2">{t('lineAdjust')}</div>
          <input
            type="number"
            value={lineTimeOffset}
            onChange={(e) => setLineTimeOffset(parseFloat(e.target.value) || 0.1)}
            className="w-16 text-xs p-1 rounded border"
            step="0.1"
          />
          <span className="text-xs">{t('seconds')}</span>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted scrollbar-thumb-rounded-md">
        {parsedLyrics.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('noLyrics')}</p>
        ) : (
          <ul className="space-y-1">
            {parsedLyrics.map((line, index) => (
              <li
                id={`lyrics-line-${index}`}
                key={index}
                className={`p-2 rounded text-sm hover:bg-muted cursor-pointer flex justify-between items-center ${index === selectedLineIndex ? 'bg-accent text-accent-foreground' : ''
                  }`}
                onClick={() => jumpToLyricLine(index)}
              >
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground mr-2">
                    {line.timestamp || '[ - ]'}
                  </span>
                  <span>{line.text}</span>
                </div>
                <div className="flex items-center">
                  {line.timestamp && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustLineTimestamp(index, -lineTimeOffset);
                        }}
                        className="opacity-50 hover:opacity-100 p-1 text-xs rounded hover:bg-muted mr-1"
                        title={t('moveBackward')}
                      >
                        -{lineTimeOffset}s
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustLineTimestamp(index, lineTimeOffset);
                        }}
                        className="opacity-50 hover:opacity-100 p-1 text-xs rounded hover:bg-muted mr-1"
                        title={t('moveForward')}
                      >
                        +{lineTimeOffset}s
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLineTimestamp(index);
                    }}
                    className="opacity-50 hover:opacity-100 p-1 px-2 rounded-full hover:bg-muted"
                    title={t('updateTimestamp')}
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LyricsList; 

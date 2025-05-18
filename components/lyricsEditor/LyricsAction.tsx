import { Upload, FilesIcon, Download, Edit, PanelLeftClose, PanelLeft } from 'lucide-react';
import { AudioTrack, MatchResults } from './types';
import { useTranslations } from 'next-intl';

interface LyricsActionProps {
  matchResults: MatchResults;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBatchLyricsImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  batchExportLyrics: () => void;
  lyricsTextCollapsed: boolean;
  setLyricsTextCollapsed: (collapsed: boolean) => void;
}

const LyricsAction = ({
  matchResults,
  handleFileImport,
  handleBatchLyricsImport,
  batchExportLyrics,
  lyricsTextCollapsed,
  setLyricsTextCollapsed,
}: LyricsActionProps) => {
  const t = useTranslations('Editor');

  return (
    <>
      {/* 文件导入 */}
      <div className="mb-1 flex flex-wrap gap-2">
        <label htmlFor="file-upload" className="flex items-center gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md w-fit text-sm">
          <Upload size={14} />
          <span>{t('importAudio')}</span>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileImport}
            className="hidden"
          />
        </label>

        <label htmlFor="batch-lyrics-upload" className="flex items-center gap-1.5 cursor-pointer bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md w-fit text-sm">
          <FilesIcon size={14} />
          <span>{t('importLyrics')}</span>
          <input
            id="batch-lyrics-upload"
            type="file"
            accept=".txt,.lrc"
            multiple
            onChange={handleBatchLyricsImport}
            className="hidden"
          />
        </label>

        <button
          onClick={batchExportLyrics}
          className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md w-fit text-sm"
          title={t('exportLyrics')}
        >
          <Download size={14} />
          <span>{t('exportLyrics')}</span>
        </button>

        <button
          onClick={() => setLyricsTextCollapsed(!lyricsTextCollapsed)}
          className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md w-fit text-sm"
          title={lyricsTextCollapsed ? t('expandEditor') : t('collapseEditor')}
        >
          {lyricsTextCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          <span>{lyricsTextCollapsed ? t('expandEditor') : t('collapseEditor')}</span>
        </button>
      </div>

      <div className="mt-2 mb-4 p-2 text-sm bg-card rounded-lg border border-muted">
        <div className="flex items-start gap-2 mb-1">
          <Upload size={14} className="text-primary mt-0.5" />
          <p className="text-xs">{t('helpText.batchImport')}</p>
        </div>
        <div className="flex items-start gap-2">
          <Edit size={14} className="text-primary mt-0.5" />
          <p className="text-xs">{t('helpText.timestampFormat')}</p>
        </div>
      </div>

      {(matchResults.success > 0 || matchResults.failed > 0) && (
        <div className="mb-6 p-3 rounded-md bg-muted/30">
          <h3 className="text-sm font-medium">{t('matchResults.title')}</h3>
          <div className="flex gap-4 mt-1">
            <div className="text-sm">
              <span className="text-green-500 font-medium mr-1">{matchResults.success}</span>
              {t('matchResults.success')}
            </div>
            <div className="text-sm">
              <span className="text-red-500 font-medium mr-1">{matchResults.failed}</span>
              {t('matchResults.failed')}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LyricsAction;

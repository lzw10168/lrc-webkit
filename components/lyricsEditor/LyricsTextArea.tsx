import { useRef } from 'react';
import { Copy, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LyricsTextAreaProps {
  lyricsText: string;
  setLyricsText: (text: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  currentTrackName?: string;
}

const LyricsTextArea = ({
  lyricsText,
  setLyricsText,
  showToast,
  currentTrackName
}: LyricsTextAreaProps) => {
  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations('Editor');

  const getFileNameWithoutExtension = (fileName: string): string => {
    return fileName?.replace(/\.[^/.]+$/, "") || "lyrics";
  };

  const exportCurrentLyrics = () => {
    if (!lyricsText) {
      showToast(t('textArea.noLyricsToExport'), 'error');
      return;
    }
    const baseFileName = getFileNameWithoutExtension(currentTrackName || '');
    const fileName = `${baseFileName}.lrc`;
    const blob = new Blob([lyricsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    showToast(t('textArea.lyricsExported', { filename: fileName }), 'success');
  };

  return (
    <div >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t('textArea.title')}</h2>
        </div>
        <div className="flex gap-2">
          {/* Copy Lyrics */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(lyricsText);
              showToast(t('textArea.lyricsCopied'));
            }}
            className="p-2 rounded-full hover:bg-muted"
            title={t('textArea.copyToClipboard')}
          >
            <Copy size={18} />
          </button>
          {/* Export Lyrics */}
          <button
            onClick={exportCurrentLyrics}
            className="p-2 rounded-full hover:bg-muted"
            title={t('textArea.exportCurrentLyrics')}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Lyrics Editor */}
      <textarea
        ref={lyricsTextareaRef}
        value={lyricsText}
        onChange={(e) => setLyricsText(e.target.value)}
        className="w-full h-[calc(100vh-200px)] p-2 border rounded font-mono text-sm resize-none bg-muted/20 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder={t('textArea.placeholder')}
      />
    </div>
  );
};

export default LyricsTextArea; 

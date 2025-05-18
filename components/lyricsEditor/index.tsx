'use client'

import { useState, useRef, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import Toast from '../ui/toast';
import LyricsTextArea from './LyricsTextArea';
import PlayList from './PlayList';
import LyricsAction from './LyricsAction';
import LyricsList from './LyricsList';
import { AudioTrack, Toast as ToastType, StoredState, LyricsLine } from './types';
import LyricsPlayer from './LyricsPlayer';
import { readFileAsText, batchExportLyrics } from '@/lib/fileHandlers';
import { compareFileNames, formatTime } from '@/lib/formatting';

// 创建一个 memoized 的 Audio 组件
const MemoizedAudio = memo(function MemoizedAudio({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement> }) {
  return <audio ref={audioRef} className="hidden" />;
}, () => true); // 永远返回 true 因为我们只想渲染一次

const LyricsEditor = () => {
  const t = useTranslations('Editor');
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [playlistWithLyrics, setPlaylistWithLyrics] = useState<AudioTrack[]>([]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [lineTimeOffset, setLineTimeOffset] = useState<number>(0.5);
  const [lyricsText, setLyricsText] = useState<string>('');
  const [parsedLyrics, setParsedLyrics] = useState<LyricsLine[]>([]);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(-1);
  const [matchResults, setMatchResults] = useState<{ success: number, failed: number }>({ success: 0, failed: 0 });
  const [lyricsTextCollapsed, setLyricsTextCollapsed] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('lyricsEditorState');
    if (savedState) {
      try {
        const parsedState: StoredState = JSON.parse(savedState);
        if (parsedState.playbackRate) {
          setPlaybackRate(parsedState.playbackRate);
        }
        if (parsedState.lyricsText) {
          setLyricsText(parsedState.lyricsText);
          parseLyrics(parsedState.lyricsText);
        }
      } catch (e) {
        console.error(t('notifications.failedToParseState'), e);
      }
    }
  }, []);

  useEffect(() => {
    if (playlist.length > 0) {
      const stateToSave: StoredState = {
        trackIndex: currentTrackIndex,
        currentTime,
        playbackRate,
        lyricsText
      };
      localStorage.setItem('lyricsEditorState', JSON.stringify(stateToSave));

      const playlistToSave = playlist.map(track => ({
        id: track.id,
        name: track.name,
        lyricsText: track.lyricsText
      }));
      localStorage.setItem('lyricsEditorPlaylist', JSON.stringify(playlistToSave));
    }
  }, [currentTrackIndex, currentTime, playbackRate, lyricsText, playlist]);



  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newTracks = Array.from(event.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file,
        url: URL.createObjectURL(file)
      }));

      setPlaylist(prev => [...prev, ...newTracks]);
      setPlaylistWithLyrics(prev => [...prev, ...newTracks]);
      setSelectedLineIndex(-1);

      if (currentTrackIndex === -1 && newTracks.length > 0) {
        setCurrentTrackIndex(0);
      }

      showToast(t('notifications.audioImported', { count: newTracks.length }));
    }
  };

  const parseLyrics = (text: string) => {
    const lines = text.split('\n');
    const parsed: LyricsLine[] = [];

    lines.forEach(line => {
      const match = line.match(/^\[(\d{2}):(\d{2}):(\d{3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3], 10);
        const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;

        parsed.push({
          timestamp: `[${match[1]}:${match[2]}:${match[3]}]`,
          text: match[4].trim(),
          time: timeInSeconds
        });
      } else if (line.trim() !== '') {
        parsed.push({
          timestamp: '',
          text: line.trim(),
          time: -1
        });
      }
    });

    const sortedParsed = parsed.sort((a, b) => {
      if (a.time === -1) return 1;
      if (b.time === -1) return -1;
      return a.time - b.time;
    });

    setParsedLyrics(sortedParsed);
    return sortedParsed;
  };

  useEffect(() => {
    parseLyrics(lyricsText);
  }, [lyricsText]);

  // 修改自动高亮当前播放行的功能
  useEffect(() => {
    if (parsedLyrics.length > 0) {
      let foundIndex = -1;

      // 找到当前时间之前的最近的歌词行
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (parsedLyrics[i].time !== -1 && parsedLyrics[i].time <= currentTime) {
          foundIndex = i;
        } else if (parsedLyrics[i].time > currentTime) {
          // 找到第一个超过当前时间的行，停止搜索
          break;
        }
      }


      // 如果找到了匹配的行，更新选中状态并滚动到可视区域
      if (foundIndex !== -1 && foundIndex !== selectedLineIndex) {
        setSelectedLineIndex(foundIndex);

        // 滚动到当前行
        const lineElement = document.getElementById(`lyrics-line-${foundIndex}`);
        if (lineElement) {
          lineElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentTime, parsedLyrics]);

  const jumpToLyricLine = (index: number) => {
    const line = parsedLyrics[index];
    if (line && line.time >= 0) {
      seekTo(line.time);
      setSelectedLineIndex(index);

      if (audioRef.current) {
        if (!isPlaying) {
          audioRef.current.play().catch(error => {
            showToast(t('player.playbackFailed', { error: error.message }), 'error');
          });
          setIsPlaying(true);
        }
      }
    }
  };

  const updateLineTimestamp = (index: number) => {
    console.log('index: ', index);
    if (index < 0 || index >= parsedLyrics.length) return;

    const formattedTime = formatTime(currentTime);
    const targetLine = parsedLyrics[index];
    const lines = lyricsText.split('\n');

    // 寻找匹配的行，使用内容匹配
    let targetIndex = -1;

    // 如果行已有时间戳，先尝试通过时间戳+内容匹配
    if (targetLine.timestamp) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(targetLine.timestamp) &&
          lines[i].includes(targetLine.text)) {
          targetIndex = i;
          break;
        }
      }
    }

    // 如果没找到，仅用内容匹配（无时间戳的情况）
    if (targetIndex === -1) {
      for (let i = 0; i < lines.length; i++) {
        // 移除潜在的时间戳部分后比较
        const lineWithoutTimestamp = lines[i].replace(/^\[.*?\]\s*/, '');
        if (lineWithoutTimestamp === targetLine.text) {
          targetIndex = i;
          break;
        }
      }
    }

    // 未找到匹配行
    if (targetIndex === -1) {
      showToast('无法找到匹配的歌词行', 'error');
      return;
    }

    // 更新找到的行
    let updatedLine = '';
    if (targetLine.timestamp) {
      // 替换已有时间戳
      updatedLine = lines[targetIndex].replace(/^\[.*?\]/, formattedTime);
    } else {
      // 添加新时间戳
      updatedLine = `${formattedTime}${lines[targetIndex]}`;
    }

    lines[targetIndex] = updatedLine;
    const updatedText = lines.join('\n');
    setLyricsText(updatedText);

    // setTimeout(() => {
    //   // 更新播放器进度到当前行
    //   seekTo(currentTime);
    // }, 100);

    showToast(`已更新匹配行时间戳: ${formattedTime}`);
  };


  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          showToast(t('player.playbackFailed', { error: error.message }), 'error');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyCurrentTime = () => {
    const formattedTime = formatTime(currentTime);
    navigator.clipboard.writeText(formattedTime)
      .then(() => {
        showToast(t('player.timestampCopied', { time: formattedTime }));
      })
      .catch(err => {
        showToast(t('notifications.copyFailed'), 'error');
        console.error('Failed to copy: ', err);
      });
  };

  const playPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const playNextTrack = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const seekTo = (timeInSeconds: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(0, Math.min(timeInSeconds, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newTime = clickPosition * duration;
      seekTo(newTime);
    }
  };

  const adjustTime = (seconds: number) => {
    if (audioRef.current) {
      seekTo(currentTime + seconds);
    }
  };

  useEffect(() => {
    if (currentTrackIndex >= 0 && playlist.length > 0) {
      if (audioRef.current) {
        audioRef.current.src = playlist[currentTrackIndex].url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            showToast(t('player.playbackFailed', { error: error.message }), 'error');
            setIsPlaying(false);
          });
        }
        showToast(t('player.nowPlaying', { name: playlist[currentTrackIndex].name }), 'info');
      }
    }
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const updateDuration = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateTime);
        audioRef.current.removeEventListener('loadedmetadata', updateDuration);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          // adjustTime(-5);
          adjustLineTimestamp(selectedLineIndex, -lineTimeOffset);
          break;
        case 'ArrowRight':
          e.preventDefault();
          // adjustTime(5);
          adjustLineTimestamp(selectedLineIndex, lineTimeOffset);
          break;
        case 'ArrowUp':
          // e.preventDefault();
          // e.stopPropagation();
          // setLineTimeOffset((prev) => Number((prev + 0.1).toFixed(1)));
          break;
        case 'ArrowDown':
          // e.preventDefault();
          // e.stopPropagation();
          // setLineTimeOffset((prev) => Number((prev - 0.1).toFixed(1)));
          break;
        case 'Space':
          e.preventDefault();
          updateLineTimestamp(selectedLineIndex + 1);
          // console.log('selectedLineIndex + 1: ', selectedLineIndex + 1);
          // togglePlayPause();
          break;
        default:
          if (e.code.startsWith('Digit') && duration > 0) {
            const digit = parseInt(e.code.replace('Digit', ''), 10);
            if (digit >= 1 && digit <= 9) {
              e.preventDefault();
              const percentage = digit / 10;
              seekTo(duration * percentage);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTrackIndex, duration, selectedLineIndex, parsedLyrics, lyricsText, currentTime]);

  useEffect(() => {
    const handleEnded = () => {
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
        showToast(t('player.playlistEnded'), 'info');
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    return () => {
      playlist.forEach(track => URL.revokeObjectURL(track.url));
      playlistWithLyrics.forEach(track => URL.revokeObjectURL(track.url));
    };
  }, []);

  useEffect(() => {
    if (currentTrackIndex >= 0 && playlistWithLyrics.length > 0) {
      const currentTrack = playlistWithLyrics[currentTrackIndex];

      if (currentTrack.lyricsText) {
        setLyricsText(currentTrack.lyricsText);
      } else {
        setLyricsText('');
      }
    }
  }, [currentTrackIndex, playlistWithLyrics]);

  useEffect(() => {
    if (currentTrackIndex >= 0 && playlist.length > 0 && lyricsText) {
      setPlaylistWithLyrics(prevPlaylist => {
        const updatedPlaylist = [...prevPlaylist];
        updatedPlaylist[currentTrackIndex] = {
          ...updatedPlaylist[currentTrackIndex],
          lyricsText: lyricsText
        };
        return updatedPlaylist;
      });
    }
  }, [lyricsText]);

  const handleBatchLyricsImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);

      let successCount = 0;
      let failCount = 0;

      const lyricsContents: { file: File, content: string }[] = [];

      for (const file of files) {
        try {
          const content = await readFileAsText(file);
          lyricsContents.push({ file, content });
        } catch (error) {
          console.error(t('notifications.fileReadError', { name: file.name }), error);
        }
      }

      const updatedPlaylist = [...playlist];
      setSelectedLineIndex(-1);

      for (const { file, content } of lyricsContents) {
        const lyricsFileName = file.name;

        let bestMatch = -1;
        let bestMatchScore = 0.7;

        for (let i = 0; i < updatedPlaylist.length; i++) {
          const audioFileName = updatedPlaylist[i].name;
          const score = compareFileNames(lyricsFileName, audioFileName);

          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = i;
          }
        }

        if (bestMatch !== -1) {
          updatedPlaylist[bestMatch].lyricsText = content;
          successCount++;

          if (bestMatch === currentTrackIndex) {
            setLyricsText(content);
          }
        } else {
          failCount++;
        }
      }

      setPlaylist(updatedPlaylist);
      setPlaylistWithLyrics(updatedPlaylist);
      setMatchResults({ success: successCount, failed: failCount });

      showToast(t('textArea.lyricsImported', { success: successCount, failed: failCount }),
        successCount > 0 ? 'success' : 'info');

      event.target.value = '';
    }
  };

  // 修改微调时间戳方法，同样使用内容匹配
  const adjustLineTimestamp = (index: number, offsetSeconds: number) => {
    if (index < 0 || index >= parsedLyrics.length) return;

    const targetLine = parsedLyrics[index];
    if (targetLine.time === -1) {
      showToast(t('textArea.noTimestamp'), 'error');
      return;
    }

    // 计算新的时间，确保不小于0
    const newTime = Math.max(0, targetLine.time + offsetSeconds);
    const formattedTime = formatTime(newTime);

    // 更新文本内容，使用内容匹配
    const lines = lyricsText.split('\n');

    // 寻找匹配行
    let targetIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(targetLine.timestamp) &&
        lines[i].includes(targetLine.text)) {
        targetIndex = i;
        break;
      }
    }

    // 未找到匹配行
    if (targetIndex === -1) {
      showToast(t('textArea.noMatchingLyrics'), 'error');
      return;
    }

    // 替换时间戳
    const updatedLine = lines[targetIndex].replace(/^\[.*?\]/, formattedTime);
    lines[targetIndex] = updatedLine;

    const updatedText = lines.join('\n');
    setLyricsText(updatedText);

    seekTo(newTime);

    showToast(t('textArea.timestampAdjusted', { offset: Math.abs(offsetSeconds).toFixed(1) }), 'success');
  };



  return (
    <div className="container mx-auto p-4 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 歌词文本和歌词行区域 */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className={`${lyricsTextCollapsed ? 'hidden' : 'md:col-span-6'} bg-card p-4 rounded-lg shadow-md`}>

              <LyricsTextArea
                lyricsText={lyricsText}
                setLyricsText={setLyricsText}
                showToast={showToast}
                currentTrackName={playlist[currentTrackIndex]?.name}
              />
            </div>
            <div className={`${lyricsTextCollapsed ? 'md:col-span-12' : 'md:col-span-6'} bg-card p-4 rounded-lg shadow-md`}>

              <LyricsList
                lineTimeOffset={lineTimeOffset}
                setLineTimeOffset={setLineTimeOffset}
                parsedLyrics={parsedLyrics}
                selectedLineIndex={selectedLineIndex}
                jumpToLyricLine={jumpToLyricLine}
                adjustLineTimestamp={adjustLineTimestamp}
                updateLineTimestamp={updateLineTimestamp}
              />
            </div>
          </div>
        </div>

        {/* 播放器和播放列表区域 */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <LyricsAction
            matchResults={matchResults}
            handleFileImport={handleFileImport}
            handleBatchLyricsImport={handleBatchLyricsImport}
            batchExportLyrics={() => batchExportLyrics(playlistWithLyrics, showToast)}
            lyricsTextCollapsed={lyricsTextCollapsed}
            setLyricsTextCollapsed={setLyricsTextCollapsed}
          />
          <LyricsPlayer
            playlist={playlist}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            progressBarRef={progressBarRef}
            copyCurrentTime={copyCurrentTime}
            playPreviousTrack={playPreviousTrack}
            playNextTrack={playNextTrack}
            adjustTime={adjustTime}
            togglePlayPause={togglePlayPause}
            setPlaybackRate={setPlaybackRate}
            handleProgressBarClick={handleProgressBarClick}
          />
          <PlayList
            playlist={playlist}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            setCurrentTrackIndex={setCurrentTrackIndex}
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <MemoizedAudio audioRef={audioRef} />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>


    </div>
  );
};

export default LyricsEditor; 

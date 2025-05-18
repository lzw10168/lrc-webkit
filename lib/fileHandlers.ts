import JSZip from 'jszip'
import { getFileNameWithoutExtension } from './formatting'
import { AudioTrack } from '@/components/lyricsEditor/types'

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        resolve(e.target.result)
      }
      else {
        reject(new Error('Failed to read file as text'))
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export const batchExportLyrics = async (
  tracksWithLyrics: AudioTrack[],
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void,
) => {
  // const tracksWithLyrics = playlist.filter(track => track.lyricsText)

  if (tracksWithLyrics.length === 0) {
    showToast('没有可导出的歌词', 'error')
    return
  }

  const zip = new JSZip()

  tracksWithLyrics.forEach(track => {
    const baseFileName = getFileNameWithoutExtension(track.name)
    const fileName = `${baseFileName}.lrc`
    zip.file(fileName, track.lyricsText || '')
  })

  try {
    const content = await zip.generateAsync({ type: 'blob' })

    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lyrics_export.zip'
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    showToast(`已导出 ${tracksWithLyrics.length} 个歌词文件`, 'success')
  }
  catch (error) {
    console.error('导出失败:', error)
    showToast('导出失败，请重试', 'error')
  }
}

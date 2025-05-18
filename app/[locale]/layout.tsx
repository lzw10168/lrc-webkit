import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

// Define metadata for different locales
const metadata: Record<string, Metadata> = {
  en: {
    title: "LRC-Webkit - Online LRC Editor",
    description: "A powerful online LRC editor with real-time timestamp marking, keyboard shortcuts, and multi-language support. Edit and create LRC files easily.",
  },
  zh: {
    title: "LRC-Webkit - 在线LRC编辑器",
    description: "强大的在线LRC歌词编辑器，支持实时时间戳标记、键盘快捷键和多语言支持。轻松编辑和创建LRC文件。",
  }
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale;
  const localeMetadata = metadata[locale] || metadata.en;

  return {
    ...localeMetadata,
    keywords: locale === 'zh'
      ? "LRC编辑器, 歌词编辑器, 音乐歌词, 时间戳, 音频同步, Next.js, React"
      : "LRC editor, lyrics editor, music lyrics, timestamp, audio sync, Next.js, React",
    authors: [{ name: "lzw10168" }],
    creator: "lzw10168",
    publisher: "lzw10168",
    robots: "index, follow",
    openGraph: {
      type: "website",
      locale: locale,
      url: `https://lrc.gooooood.top/${locale}`,
      siteName: "LRC-Webkit",
      title: localeMetadata.title || "",
      description: localeMetadata.description || "",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: locale === 'zh' ? "LRC-Webkit 预览" : "LRC-Webkit Preview"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: localeMetadata.title || "",
      description: localeMetadata.description || "",
      images: ["/og-image.png"]
    },
    viewport: "width=device-width, initial-scale=1",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "white" },
      { media: "(prefers-color-scheme: dark)", color: "black" }
    ],
    alternates: {
      canonical: `https://lrc.gooooood.top/${locale}`,
      languages: {
        'en': 'https://lrc.gooooood.top/en',
        'zh': 'https://lrc.gooooood.top/zh'
      }
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div lang={locale}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
} 

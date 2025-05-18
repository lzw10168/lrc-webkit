'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages } from "lucide-react"
import { useRouter, usePathname, useParams } from 'next/navigation';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

export function LanguageToggle() {
  const locale = useParams().locale as string;
  const router = useRouter();
  const pathname = usePathname();
  const handleLocaleChange = (newLocale: string) => {
    trackEvent(AnalyticsEvents.SWITCH_LANGUAGE, {
      from: locale,
      to: newLocale
    });
    const newPathname = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${newPathname}`);
  }

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[72px] h-8 px-2">
        <Languages className="mr-1 h-3.5 w-3.5" />
        <SelectValue>
          {locale === 'zh' ? '中' : 'EN'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh" className="flex items-center">
          <span className="mr-1.5">🇨🇳</span>
          中文
        </SelectItem>
        <SelectItem value="en" className="flex items-center">
          <span className="mr-1.5">🇺🇸</span>
          English
        </SelectItem>
      </SelectContent>
    </Select>
  )
} 

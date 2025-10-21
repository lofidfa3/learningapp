'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/types';
import { saveSelectedLanguage } from '@/lib/storage';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  function handleLanguageChange(newValue: string) {
    onChange(newValue);
    saveSelectedLanguage(newValue);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Target Language:</label>
      <Select value={value} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
            <SelectItem key={key} value={key}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


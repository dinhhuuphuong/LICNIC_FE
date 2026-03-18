import type { PropsWithChildren } from 'react';
import { LanguageProvider } from '@/contexts/NgonNguContext';

export function AppProviders({ children }: PropsWithChildren) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

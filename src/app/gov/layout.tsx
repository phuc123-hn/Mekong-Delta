import { ReactNode } from 'react';
import AppShell from '@/components/app-shell';

export default function GovLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

// /app/_layout.tsx
import { Slot } from 'expo-router';
import { ThemeProvider } from '@/hooks/useTheme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}

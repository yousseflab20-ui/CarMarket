import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export function useAppTheme() {
    const theme = useThemeStore((state: any) => state.theme);
    const systemTheme = useColorScheme();
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

    return { theme, systemTheme, isDark };
}

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2f95dc',
    icon: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
    tabBarBackground: '#ffffff', // ✅ Add this
    border: '#e0e0e0',           // ✅ Optional: for border color
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#ffffff',
    icon: '#ffffff',
    tabIconDefault: '#888',
    tabIconSelected: '#ffffff',
    tabBarBackground: '#121212', // ✅ Add this
    border: '#333',              // ✅ Optional: for border color
  },
};

import { useWindowDimensions } from "react-native";

const PHONE_MAX_CONTENT_WIDTH = 560;
const LANDSCAPE_PHONE_MAX_CONTENT_WIDTH = 680;
const LARGE_SCREEN_MAX_CONTENT_WIDTH = 720;

export function useResponsiveLayout() {
  const { fontScale, height, width } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isCompactWidth = width < 360;
  const isLargeScreen = shortestSide >= 600;
  const isLandscape = width > height;

  const contentMaxWidth = isLargeScreen
    ? LARGE_SCREEN_MAX_CONTENT_WIDTH
    : isLandscape
      ? LANDSCAPE_PHONE_MAX_CONTENT_WIDTH
      : PHONE_MAX_CONTENT_WIDTH;

  return {
    contentMaxWidth,
    fontScale,
    height,
    horizontalPadding: isCompactWidth ? 14 : isLargeScreen ? 28 : 20,
    isCompactWidth,
    isLandscape,
    isLargeScreen,
    width,
  };
}

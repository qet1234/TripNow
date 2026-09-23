import { useEffect, useRef, type ComponentProps } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = Omit<ComponentProps<typeof Pressable>, "style"> & {
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionPressable({
  onHoverIn,
  onHoverOut,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const hovering = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) reduceMotion.current = enabled;
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotion.current = enabled;
      if (enabled) scale.setValue(1);
    });

    return () => {
      mounted = false;
      subscription.remove();
      scale.stopAnimation();
    };
  }, [scale]);

  const animateTo = (value: number) => {
    if (reduceMotion.current) return;
    Animated.spring(scale, {
      toValue: value,
      stiffness: 330,
      damping: 19,
      mass: 0.5,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      onHoverIn={(event) => {
        hovering.current = true;
        animateTo(1.02);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        hovering.current = false;
        animateTo(1);
        onHoverOut?.(event);
      }}
      onPressIn={(event) => {
        animateTo(0.96);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(hovering.current ? 1.02 : 1);
        onPressOut?.(event);
      }}
      style={[style, { opacity: scale.interpolate({ inputRange: [0.96, 1], outputRange: [0.88, 1], extrapolate: "clamp" }), transform: [{ scale }] }]}
    />
  );
}

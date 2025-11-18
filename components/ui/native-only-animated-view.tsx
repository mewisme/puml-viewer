import Animated from 'react-native-reanimated';

/**
 * This component is used to wrap animated views for iOS and Android.
 * @param props - The props for the animated view.
 * @returns The animated view.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am animated on native platforms</Text>
 * </NativeOnlyAnimatedView>
 */
function NativeOnlyAnimatedView(
  props: React.ComponentProps<typeof Animated.View> & React.RefAttributes<Animated.View>
) {
  return <Animated.View {...props} />;
}

export { NativeOnlyAnimatedView };

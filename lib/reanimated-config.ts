import { ReanimatedLogLevel, configureReanimatedLogger } from 'react-native-reanimated';

if (__DEV__) {
  configureReanimatedLogger({
    strict: false,
    level: ReanimatedLogLevel.error,
  });
}


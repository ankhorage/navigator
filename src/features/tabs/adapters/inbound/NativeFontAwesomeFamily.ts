import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';

import type { NativeVectorIconFamily } from './NativeVectorIconFamily';

/*** Ionicons-compatible Font Awesome family adapter for Expo Native Tabs. */
export const NativeFontAwesomeFamily = FontAwesome as unknown as NativeVectorIconFamily;

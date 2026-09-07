import {
  FontAwesome5,
  type FontAwesome5RegularIconName,
} from '@react-native-vector-icons/fontawesome5/static';

import type { NativeVectorIconFamily } from '../../../../types/nativeIcons';

/*** Regular-style Font Awesome 5 family adapter for Expo Native Tabs. */
export const NativeFontAwesome5Family: NativeVectorIconFamily = {
  /*** Request a regular-style image using Expo Native Tabs' required family method signature. */
  getImageSource(name, size, color) {
    return FontAwesome5.getImageSource('regular', name as FontAwesome5RegularIconName, size, color);
  },
};

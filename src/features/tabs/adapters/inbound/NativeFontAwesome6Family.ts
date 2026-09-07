import {
  FontAwesome6,
  type FontAwesome6RegularIconName,
} from '@react-native-vector-icons/fontawesome6/static';
import type { ColorValue, ImageSourcePropType } from 'react-native';

import type { NativeVectorIconFamily } from '../../../../types/nativeIcons';

/*** Regular-style Font Awesome 6 family adapter for Expo Native Tabs. */
export const NativeFontAwesome6Family: NativeVectorIconFamily = {
  /*** Request a regular-style image using Expo Native Tabs' required family method signature. */
  getImageSource(
    name: string,
    size: number,
    color: ColorValue,
  ): Promise<ImageSourcePropType | null> {
    return FontAwesome6.getImageSource('regular', name as FontAwesome6RegularIconName, size, color);
  },
};

import { FontAwesome } from '@react-native-vector-icons/fontawesome/static';
import {
  FontAwesome5,
  type FontAwesome5RegularIconName,
} from '@react-native-vector-icons/fontawesome5/static';
import {
  FontAwesome6,
  type FontAwesome6RegularIconName,
} from '@react-native-vector-icons/fontawesome6/static';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import type { ColorValue, ImageSourcePropType } from 'react-native';

interface NativeVectorIconFamily {
  getImageSource(
    name: string,
    size: number,
    color: ColorValue,
  ): Promise<ImageSourcePropType | null>;
}

/*** Ionicons-compatible Font Awesome family adapter for Expo Native Tabs. */
export const NativeFontAwesomeFamily = FontAwesome as unknown as NativeVectorIconFamily;
/*** Ionicons family adapter for Expo Native Tabs. */
export const NativeIoniconsFamily = Ionicons as unknown as NativeVectorIconFamily;
/*** Material Design Icons family adapter for Expo Native Tabs. */
export const NativeMaterialDesignIconsFamily =
  MaterialDesignIcons as unknown as NativeVectorIconFamily;

/*** Regular-style Font Awesome 5 family adapter for Expo Native Tabs. */
export const NativeFontAwesome5Family: NativeVectorIconFamily = {
  getImageSource(name, size, color) {
    return FontAwesome5.getImageSource('regular', name as FontAwesome5RegularIconName, size, color);
  },
};

/*** Regular-style Font Awesome 6 family adapter for Expo Native Tabs. */
export const NativeFontAwesome6Family: NativeVectorIconFamily = {
  getImageSource(
    name: string,
    size: number,
    color: ColorValue,
  ): Promise<ImageSourcePropType | null> {
    return FontAwesome6.getImageSource('regular', name as FontAwesome6RegularIconName, size, color);
  },
};

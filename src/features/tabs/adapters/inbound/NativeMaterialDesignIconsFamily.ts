import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';

import type { NativeVectorIconFamily } from '../../../../types/nativeIcons';

/*** Material Design Icons family adapter for Expo Native Tabs. */
export const NativeMaterialDesignIconsFamily =
  MaterialDesignIcons as unknown as NativeVectorIconFamily;

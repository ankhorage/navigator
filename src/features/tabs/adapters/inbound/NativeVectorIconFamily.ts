import type { ColorValue, ImageSourcePropType } from 'react-native';

export interface NativeVectorIconFamily {
  getImageSource(
    name: string,
    size: number,
    color: ColorValue,
  ): Promise<ImageSourcePropType | null>;
}

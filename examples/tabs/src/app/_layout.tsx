import { NativeIoniconsFamily } from '@ankhorage/navigator/tabs/native-icons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export const unstable_settings = { initialRouteName: 'index' };

export default function NavigatorLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{'Overview'}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={NativeIoniconsFamily} name="home" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{'Settings'}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={NativeIoniconsFamily} name="settings" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

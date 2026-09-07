import { RegisteredCustomNavigator } from '@/navigators/registered-custom-navigator';

export default function NavigatorLayout() {
  return (
    <RegisteredCustomNavigator {...{ backBehavior: 'history' }}>
      <RegisteredCustomNavigator.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <RegisteredCustomNavigator.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </RegisteredCustomNavigator>
  );
}

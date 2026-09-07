import { Stack } from 'expo-router';

import { isExampleEnabled as navigatorGuard0 } from '@/guards/is-example-enabled';

export default function NavigatorLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <Stack.Protected guard={navigatorGuard0()}>
        <Stack.Screen
          name="details"
          options={{
            title: 'Details',
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="modal"
        options={{
          title: 'Modal',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

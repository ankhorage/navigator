import { Stack } from 'expo-router';

export default function NavigatorLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: 'Details',
        }}
      />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function NavigatorLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Entry',
        }}
      />
      <Stack.Screen
        name="workspace"
        options={{
          title: 'Workspace',
        }}
      />
    </Stack>
  );
}

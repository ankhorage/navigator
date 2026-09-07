import { Tabs } from 'expo-router/js-tabs';

export default function NavigatorLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
        }}
      />
    </Tabs>
  );
}

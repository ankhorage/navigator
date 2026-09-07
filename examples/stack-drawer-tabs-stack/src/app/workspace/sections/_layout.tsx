import { Tabs } from 'expo-router/js-tabs';

export default function NavigatorLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(overview)"
        options={{
          title: 'Overview',
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
        }}
      />
    </Tabs>
  );
}

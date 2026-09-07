import { TopTabs } from 'expo-router/js-top-tabs';

export default function NavigatorLayout() {
  return (
    <TopTabs>
      <TopTabs.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <TopTabs.Screen
        name="activity"
        options={{
          title: 'Activity',
        }}
      />
    </TopTabs>
  );
}

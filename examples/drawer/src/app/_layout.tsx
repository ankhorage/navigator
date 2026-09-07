import { Drawer } from 'expo-router/drawer';

export default function NavigatorLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Overview',
          drawerLabel: 'Overview',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
        }}
      />
    </Drawer>
  );
}

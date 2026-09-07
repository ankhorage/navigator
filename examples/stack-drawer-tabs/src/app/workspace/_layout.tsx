import { Drawer } from 'expo-router/drawer';

export default function NavigatorLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="sections"
        options={{
          title: 'Sections',
          drawerLabel: 'Sections',
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

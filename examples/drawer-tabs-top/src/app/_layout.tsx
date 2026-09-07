import { Drawer } from 'expo-router/drawer';

export default function NavigatorLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="(workspace)"
        options={{
          title: 'Workspace',
          drawerLabel: 'Workspace',
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

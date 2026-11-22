import { expect, mock, test } from 'bun:test';
import { createElement } from 'react';

const switchTab = mock(() => undefined);

mock.module('expo-router/ui', () => ({
  useTabTrigger: () => ({ switchTab, trigger: { isFocused: true } }),
}));

const { NavigatorTabTrigger } =
  await import('../src/features/tabs/adapters/inbound/NavigatorTabTrigger');

test('binds active Expo Router state and navigation action for a custom presentation item', () => {
  let rendered: ReturnType<typeof createElement> | undefined;
  let onClick: (() => void) | undefined;

  NavigatorTabTrigger({
    route: {
      href: '/settings',
      icon: { name: 'settings', provider: 'Ionicons' },
      label: 'Settings',
      name: 'settings',
      visible: true,
    },
    render: (item) => {
      onClick = item.onPress;
      rendered = createElement('button', {
        'aria-selected': item.accessibilityState.selected,
        disabled: item.disabled,
        onClick: item.onPress,
      });
      expect(item).toMatchObject({
        accessibilityState: { disabled: false, selected: true },
        active: true,
        href: '/settings',
        label: 'Settings',
        name: 'settings',
      });
      expect(item.icon).toEqual({ name: 'settings', provider: 'Ionicons' });
      return rendered;
    },
  });

  expect(rendered).toBeDefined();
  onClick?.();
  expect(switchTab).toHaveBeenCalledWith('settings', {});
});

test('keeps disabled presentation items from navigating', () => {
  switchTab.mockClear();
  NavigatorTabTrigger({
    route: { disabled: true, href: '/locked', label: 'Locked', name: 'locked', visible: true },
    render: (item) => {
      expect(item.accessibilityState).toEqual({ disabled: true, selected: true });
      item.onPress();
      return null;
    },
  });
  expect(switchTab).not.toHaveBeenCalled();
});

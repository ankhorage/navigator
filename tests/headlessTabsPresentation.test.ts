import { expect, mock, test } from 'bun:test';
import { createElement, type ReactNode } from 'react';

import type { HeadlessTabsItem } from '../src/types/headlessTabs';

const switchTab = mock(() => undefined);

mock.module('expo-router/ui', () => ({
  TabList: ({ children }: { children: ReactNode }) => children,
  TabSlot: () => null,
  TabTrigger: () => null,
  Tabs: ({ children }: { children: ReactNode }) => children,
  useTabTrigger: () => ({ switchTab, trigger: { isFocused: true } }),
}));
mock.module('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));
mock.module('react-native', () => ({
  Pressable: () => null,
  ScrollView: () => null,
  StyleSheet: {
    compose: (left: unknown, right: unknown) => [left, right],
    create: (styles: unknown) => styles,
    hairlineWidth: 1,
  },
  Text: () => null,
  View: () => null,
}));
mock.module('../src/utils/useHydrationSafeSize', () => ({
  useHydrationSafeSize: () => 'compact',
}));

const { NavigatorTabTrigger } =
  await import('../src/features/tabs/adapters/inbound/NavigatorTabTrigger');
const { HeadlessTabsLayout } =
  await import('../src/features/tabs/adapters/inbound/HeadlessTabsLayout');

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

test('binds a supplied custom presentation to every selected responsive mode', () => {
  const route = {
    href: '/settings',
    icon: { name: 'settings', provider: 'Ionicons' },
    label: 'Settings',
    name: 'settings',
    visible: true,
  } as const;
  const expected = [
    ['bottom', 'horizontal'],
    ['top', 'horizontal'],
    ['rail', 'vertical'],
    ['sidebar', 'vertical'],
  ] as const;

  for (const [presentation, orientation] of expected) {
    switchTab.mockClear();
    const CustomPresentation = () => null;
    const layout = HeadlessTabsLayout({
      customPresentation: CustomPresentation,
      presentations: { compact: presentation, expanded: presentation, medium: presentation },
      routes: [route],
    });
    const body = layout.props.children[0];
    const bodyView = body.type(body.props);
    const navigationPanel = bodyView.props.children[presentation === 'bottom' ? 3 : 0];
    const navigation = navigationPanel.props.children;
    const renderedPresentation = navigation.type(navigation.props);

    expect(renderedPresentation.type).toBe(CustomPresentation);
    expect(renderedPresentation.props.presentation).toBe(presentation);
    expect(renderedPresentation.props.orientation).toBe(orientation);

    let item: HeadlessTabsItem | undefined;
    const trigger = renderedPresentation.props.renderItem(route, (current: HeadlessTabsItem) => {
      item = current;
      return null;
    });
    trigger.type(trigger.props);

    expect(item?.active).toBe(true);
    item?.onPress();
    expect(switchTab).toHaveBeenCalledWith('settings', {});
  }
});

import { HeadlessTabsLayout } from '@ankhorage/navigator/tabs';

const routes = [
  {
    name: '(overview)',
    href: '/',
    label: 'Overview',
    visible: true,
  },
  {
    name: 'settings',
    href: '/settings',
    label: 'Settings',
    visible: true,
  },
] as const;
const presentations = { compact: 'bottom', medium: 'bottom', expanded: 'bottom' } as const;

export default function NavigatorLayout() {
  return <HeadlessTabsLayout presentations={presentations} routes={routes} />;
}

import { HeadlessTabsLayout } from '@ankhorage/navigator/tabs';

const routes = [
  {
    name: '(overview)',
    href: '/workspace',
    label: 'Overview',
    visible: true,
  },
  {
    name: 'library',
    href: '/workspace/library',
    label: 'Library',
    visible: true,
  },
] as const;
const presentations = { compact: 'bottom', medium: 'rail', expanded: 'sidebar' } as const;

export default function NavigatorLayout() {
  return <HeadlessTabsLayout presentations={presentations} routes={routes} />;
}

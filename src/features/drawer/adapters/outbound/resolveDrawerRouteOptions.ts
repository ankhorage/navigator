import type { NavigatorRoutePlan } from '../../../../utils/NavigatorRoutePlan';

/*** Translate a route label and primary-navigation visibility into Drawer screen options. */
export function resolveDrawerRouteOptions(route: NavigatorRoutePlan): Record<string, unknown> {
  return {
    ...(route.label === undefined ? {} : { drawerLabel: route.label }),
    ...(route.showInPrimaryNavigation === false ? { drawerItemStyle: { display: 'none' } } : {}),
  };
}

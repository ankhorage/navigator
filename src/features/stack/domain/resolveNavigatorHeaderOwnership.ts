import type {
  NavigatorNodePlan,
  NavigatorPlan,
  NavigatorRoutePlan,
} from '@ankhorage/contracts/navigator';

/**
 * Resolve all visible Stack headers on the path that owns a screen, then report whether app chrome
 * can render independently without duplicating a Navigator header.
 */
export function resolveNavigatorHeaderOwnership(
  plan: NavigatorPlan,
  args: NavigatorHeaderOwnershipArgs = {},
): NavigatorHeaderOwnership {
  const navigatorHeaders = resolveVisibleHeaders(plan.root, args.screenId);
  const externalHeaderVisible = args.externalHeaderVisible ?? false;
  const owner =
    navigatorHeaders.length > 1 || (navigatorHeaders.length === 1 && externalHeaderVisible)
      ? 'conflict'
      : navigatorHeaders.length === 1
        ? 'navigator'
        : externalHeaderVisible
          ? 'external'
          : 'none';
  return { owner, navigatorHeaders };
}

/** The owner selected after comparing visible Navigator Stack headers with external app chrome. */
type NavigatorHeaderOwner = 'conflict' | 'external' | 'navigator' | 'none';

/** An external app bar and the currently rendered screen select the active navigator path. */
interface NavigatorHeaderOwnershipArgs {
  externalHeaderVisible?: boolean;
  screenId?: string;
}

/** One Stack header that would be visible on the selected navigator path. */
interface ResolvedNavigatorHeader {
  navigatorPointer: string;
  routeName: string;
  title?: string;
}

/** A pure resolution result for app shells that need one explicit header owner. */
interface NavigatorHeaderOwnership {
  owner: NavigatorHeaderOwner;
  navigatorHeaders: readonly ResolvedNavigatorHeader[];
}

/** Walk the one nested route branch that contains the requested screen. */
function resolveVisibleHeaders(
  node: NavigatorNodePlan,
  screenId: string | undefined,
): readonly ResolvedNavigatorHeader[] {
  const route = selectActiveRoute(node, screenId);
  if (route === undefined) return [];
  const nestedHeaders =
    route.navigator === undefined ? [] : resolveVisibleHeaders(route.navigator, screenId);
  if (node.type !== 'stack' || !isStackHeaderVisible(node, route)) return nestedHeaders;
  const title = resolveHeaderTitle(route);
  return [
    {
      navigatorPointer: node.pointer,
      routeName: route.name,
      ...(title === undefined ? {} : { title }),
    },
    ...nestedHeaders,
  ];
}

/** Favor an exact screen match, then use initial route and finally authored route order. */
function selectActiveRoute(
  node: NavigatorNodePlan,
  screenId: string | undefined,
): NavigatorRoutePlan | undefined {
  if (screenId !== undefined) {
    const matchedRoute = node.routes.find(
      (route) => route.screenId === screenId || navigatorContainsScreen(route.navigator, screenId),
    );
    if (matchedRoute !== undefined) return matchedRoute;
  }
  return node.routes.find((route) => route.name === node.initialRouteName) ?? node.routes[0];
}

/** Determine whether one nested navigator contains the selected screen. */
function navigatorContainsScreen(node: NavigatorNodePlan | undefined, screenId: string): boolean {
  return (
    node?.routes.some(
      (route) => route.screenId === screenId || navigatorContainsScreen(route.navigator, screenId),
    ) ?? false
  );
}

/** Match Expo Stack precedence: explicit route options, node screen options, then the visible default. */
function isStackHeaderVisible(node: NavigatorNodePlan, route: NavigatorRoutePlan): boolean {
  return route.stackOptions?.headerShown ?? node.stack?.options?.headerShown ?? true;
}

/** Only use author-provided titles; group implementation names are never display titles. */
function resolveHeaderTitle(route: NavigatorRoutePlan): string | undefined {
  return route.stackOptions?.title ?? route.label;
}

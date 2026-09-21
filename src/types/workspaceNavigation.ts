import type { RouteDefinition } from '@ankhorage/contracts/navigator';

/** One consumer-owned destination projected into Navigator's workspace presentation. */
export interface WorkspaceNavigationRoute {
  readonly id: string;
  readonly label: string;
  readonly icon?: RouteDefinition['icon'];
  readonly href: string | null;
  readonly parentId?: string;
  readonly description?: string;
  readonly visible?: boolean;
}

/** A destination outside the workspace, such as the most recent application route. */
export interface WorkspaceExitDestination {
  readonly label: string;
  readonly href: string;
}

/** Runtime inputs for a workspace whose page and route semantics belong to its consumer. */
export interface WorkspaceNavigatorProps {
  readonly routes: readonly WorkspaceNavigationRoute[];
  readonly activeRouteId: string;
  readonly title: string;
  readonly exit?: WorkspaceExitDestination;
  readonly onNavigate?: (routeId: string) => void;
}

/** A navigation entry with Navigator-owned ancestor and selection state. */
export interface ResolvedWorkspaceNavigationRoute extends WorkspaceNavigationRoute {
  readonly active: boolean;
  readonly selected: boolean;
  readonly depth: number;
}

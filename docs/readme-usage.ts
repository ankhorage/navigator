/***
 * Catalog → Validate → Plan → Generate → Verify
 *
 * Navigator consumes only an `AppNavigatorManifest`, narrow module bindings, and target context.
 * It never needs the complete `AppManifest`, themes, secrets, infrastructure, deployment data, or
 * Studio state. `@ankhorage/contracts/navigator` owns structural parsing; Navigator owns semantic
 * target validation, capability metadata, planning, generation, and Navigator-specific evidence.
 *
 * The taxonomy stays orthogonal:
 *
 * | Dimension | Examples |
 * | --- | --- |
 * | Topology | Slot, Stack, Tabs, Drawer, Split View, registered Custom |
 * | Implementation | native, JavaScript, headless, experimental |
 * | Presentation | bottom, top, rail, sidebar, adaptive, custom, two-column, three-column |
 * | Preset | `drawer`, `stack-tabs`, `stack-tabs-stack`, `drawer-tabs-stack` |
 *
 * Tabs are always Tabs; top and bottom are presentations. `drawer` is a complete root preset with
 * direct routes. Presets resolve to ordinary recursive manifest input. Navigator has no flow field:
 * onboarding, survey, setup, checkout, and authentication are app-owned routes, nested navigators,
 * guards, and state. For example, `stack-tabs-stack` can represent a neutral pre-main sequence
 * followed by Tabs whose branches own Stacks without encoding application semantics.
 *
 * The programmatic example below returns stable relative files and contents, dependency
 * requirements, diagnostics, support, the resolved plan, and capability IDs. It performs no writes.
 * To materialize the same contract into an Expo app, save the manifest and bindings as JSON and run:
 *
 * ```sh
 * ankh navigator catalog
 * ankh navigator validate --manifest navigator.json --bindings navigator.bindings.json --platform web --expo-router-version "$EXPO_ROUTER_VERSION"
 * ankh navigator plan --manifest navigator.json --platform web --expo-router-version "$EXPO_ROUTER_VERSION" --json
 * ankh navigator generate --manifest navigator.json --bindings navigator.bindings.json --platform web --expo-router-version "$EXPO_ROUTER_VERSION" --target ./my-app
 * ankh navigator verify --manifest navigator.json --bindings navigator.bindings.json --platform web --expo-router-version "$EXPO_ROUTER_VERSION"
 * bun --cwd ./my-app expo start
 * ```
 *
 * Human-readable output is the default; `--json` emits the stable versioned envelope. Generation
 * requires an explicit target. Custom navigator registries are executable consumer modules passed
 * with `--custom-navigators`; screen, guard, icon-resolver, and custom Tabs-presentation bindings
 * remain narrow JSON module/symbol records.
 *
 * Capability metadata separates `support`, `stability`, and each verification layer. Experimental
 * Stack and iOS Split View are testing-only. A non-iOS Slot fallback is explicitly not Split View.
 * Install, export, browser, simulator, and device evidence remains unverified until the standalone
 * example acceptance layer records it; planning or compilation never promotes those claims.
 *
 * Studio and future composers read `getNavigatorCatalog()`, author `manifest.navigator`, and invoke
 * this same lifecycle. They do not own a second capability table.
 *
 * @usage
 */
import type {
  AppNavigatorManifest,
  NavigatorGenerationBindings,
} from '@ankhorage/contracts/navigator';
import expoRouterPackage from 'expo-router/package.json';

import {
  createNavigatorPlan,
  generateNavigator,
  getNavigatorCatalog,
  validateNavigator,
  verifyNavigator,
} from '@ankhorage/navigator';

const manifest = {
  type: 'drawer',
  initialRouteName: 'index',
  routes: [
    { name: 'index', label: 'Home', screenId: 'home' },
    { name: 'settings', label: 'Settings', screenId: 'settings' },
  ],
} as const satisfies AppNavigatorManifest;

const bindings = {
  screens: {
    home: { module: '@/screens/HomeScreen', exportName: 'HomeScreen' },
    settings: { module: '@/screens/SettingsScreen', exportName: 'SettingsScreen' },
  },
  guards: {},
} as const satisfies NavigatorGenerationBindings;

const target = {
  platform: 'web',
  expoRouterVersion: expoRouterPackage.version,
} as const;

const diagnostics = validateNavigator(manifest, bindings, target);
const plan = createNavigatorPlan(manifest, target);
const generation = generateNavigator(plan, bindings);
const verification = verifyNavigator(plan, bindings);

console.log({
  catalog: getNavigatorCatalog(),
  diagnostics,
  plan,
  generation,
  verification,
});

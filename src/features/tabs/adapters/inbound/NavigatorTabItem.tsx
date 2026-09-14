import {
  Box,
  ButtonBase,
  Icon,
  type IconSource,
  type SurfaceTheme,
  Text,
  useTheme,
} from '@ankhorage/surface';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

/*** Render one Navigator-owned tab trigger using current Surface foundation primitives. */
export function NavigatorTabItem({
  active,
  badge,
  icon,
  label,
  onPress,
  orientation,
  testID,
}: NavigatorTabItemProps) {
  const { theme } = useTheme();
  const horizontal = orientation === 'horizontal';
  const rail = orientation === 'rail';

  return (
    <ButtonBase
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={horizontal ? styles.horizontalButton : styles.verticalButton}
      testID={testID}
    >
      {(state) =>
        renderNavigatorTabItemContent({
          active,
          badge,
          horizontal,
          icon,
          label,
          rail,
          state,
          theme,
        })
      }
    </ButtonBase>
  );
}

interface NavigatorTabItemProps {
  active: boolean;
  badge?: ReactNode;
  icon?: IconSource;
  label: string;
  onPress: () => void;
  orientation: 'horizontal' | 'rail' | 'sidebar';
  testID: string;
}

interface NavigatorTabItemRenderState {
  hovered: boolean;
  pressed: boolean;
}

interface NavigatorTabItemContentInput extends Omit<
  NavigatorTabItemProps,
  'onPress' | 'orientation' | 'testID'
> {
  horizontal: boolean;
  rail: boolean;
  state: NavigatorTabItemRenderState;
  theme: SurfaceTheme;
}

/*** Select the horizontal or vertical content renderer for one Navigator tab item. */
function renderNavigatorTabItemContent(input: NavigatorTabItemContentInput) {
  const colors = resolveNavigatorTabItemColors(input.theme, input.active, input.state);
  if (input.horizontal) return renderHorizontalNavigatorTabItem(input, colors);
  return input.rail
    ? renderRailNavigatorTabItem(input, colors)
    : renderSidebarNavigatorTabItem(input, colors);
}

interface NavigatorTabItemColors {
  backgroundColor: string;
  contentColor: string;
}

/*** Render a bottom/top Navigator tab item. */
function renderHorizontalNavigatorTabItem(
  { active, icon, label }: NavigatorTabItemContentInput,
  colors: NavigatorTabItemColors,
) {
  return (
    <Box bg={colors.backgroundColor} px="m" py="m" style={styles.horizontalContent}>
      {icon ? (
        <Box mb="xs">
          <Icon {...icon} color={colors.contentColor} size="m" />
        </Box>
      ) : null}
      <Text
        color={active ? 'primary' : undefined}
        emphasis={active ? 'default' : 'muted'}
        numberOfLines={1}
        variant="label"
        weight="medium"
      >
        {label}
      </Text>
    </Box>
  );
}

/*** Render a compact navigation-rail item with icon-first vertical rhythm. */
function renderRailNavigatorTabItem(
  { active, badge, icon, label, theme }: NavigatorTabItemContentInput,
  colors: NavigatorTabItemColors,
) {
  return (
    <Box bg={colors.backgroundColor} px="xs" py="s" radius="m" style={styles.railContent}>
      {icon ? (
        <Box mb="xs">
          <Icon {...icon} color={colors.contentColor} size="m" />
        </Box>
      ) : null}
      <Text
        align="center"
        color={active ? 'primary' : undefined}
        emphasis={active ? 'default' : 'muted'}
        numberOfLines={1}
        variant="bodySmall"
        weight="medium"
      >
        {label}
      </Text>
      {badge ? (
        <Box position="absolute" right={theme.spacing.xs} top={theme.spacing.xs}>
          {badge}
        </Box>
      ) : null}
    </Box>
  );
}

/*** Render a full-width navigation-sidebar item with comfortable horizontal rhythm. */
function renderSidebarNavigatorTabItem(
  { active, badge, icon, label }: NavigatorTabItemContentInput,
  colors: NavigatorTabItemColors,
) {
  return (
    <Box bg={colors.backgroundColor} px="m" py="s" radius="m" style={styles.sidebarContent}>
      {icon ? (
        <Box mr="s">
          <Icon {...icon} color={colors.contentColor} size="l" />
        </Box>
      ) : null}
      <Box flex={1}>
        <Text
          color={active ? 'primary' : undefined}
          emphasis={active ? 'default' : 'muted'}
          numberOfLines={1}
          variant="body"
          weight="medium"
        >
          {label}
        </Text>
      </Box>
      {badge ? <Box ml="s">{badge}</Box> : null}
    </Box>
  );
}

/*** Resolve Navigator tab colors from the current Surface theme interaction tokens. */
function resolveNavigatorTabItemColors(
  theme: SurfaceTheme,
  active: boolean,
  state: NavigatorTabItemRenderState,
): NavigatorTabItemColors {
  if (active) {
    return {
      backgroundColor: state.pressed
        ? theme.semantics.action.primary.softActive
        : state.hovered
          ? theme.semantics.action.primary.softHover
          : theme.semantics.action.primary.softBg,
      contentColor: state.pressed
        ? theme.semantics.action.primary.onSoftActiveText
        : state.hovered
          ? theme.semantics.action.primary.onSoftHoverText
          : theme.semantics.action.primary.onSoftText,
    };
  }

  return {
    backgroundColor: state.pressed
      ? theme.semantics.neutral.surfaceActive
      : state.hovered
        ? theme.semantics.neutral.surfaceHover
        : 'transparent',
    contentColor: theme.semantics.content.default,
  };
}

const styles = StyleSheet.create({
  horizontalButton: { flex: 1 },
  horizontalContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  railContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    position: 'relative',
    width: '100%',
  },
  sidebarContent: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
    width: '100%',
  },
  verticalButton: { width: '100%' },
});

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
  compact,
  icon,
  label,
  onPress,
  orientation,
  testID,
}: NavigatorTabItemProps) {
  const { theme } = useTheme();
  const horizontal = orientation === 'horizontal';

  return (
    <ButtonBase
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={horizontal ? styles.horizontalButton : undefined}
      testID={testID}
    >
      {(state) =>
        renderNavigatorTabItemContent({
          active,
          badge,
          compact,
          horizontal,
          icon,
          label,
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
  compact: boolean;
  icon?: IconSource;
  label: string;
  onPress: () => void;
  orientation: 'horizontal' | 'vertical';
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
  state: NavigatorTabItemRenderState;
  theme: SurfaceTheme;
}

/*** Select the horizontal or vertical content renderer for one Navigator tab item. */
function renderNavigatorTabItemContent(input: NavigatorTabItemContentInput) {
  const colors = resolveNavigatorTabItemColors(input.theme, input.active, input.state);
  return input.horizontal
    ? renderHorizontalNavigatorTabItem(input, colors)
    : renderVerticalNavigatorTabItem(input, colors);
}

interface NavigatorTabItemColors {
  backgroundColor: string;
  contentColor: string;
}

/*** Render a bottom/top Navigator tab item. */
function renderHorizontalNavigatorTabItem(
  { active, compact, icon, label }: NavigatorTabItemContentInput,
  colors: NavigatorTabItemColors,
) {
  return (
    <Box
      bg={colors.backgroundColor}
      px="m"
      py={compact ? 's' : 'm'}
      style={styles.horizontalContent}
    >
      {icon ? (
        <Box mb="xs">
          <Icon {...icon} color={colors.contentColor} size={compact ? 's' : 'm'} />
        </Box>
      ) : null}
      <Text
        color={active ? 'primary' : undefined}
        emphasis={active ? 'default' : 'muted'}
        numberOfLines={1}
        variant={compact ? 'bodySmall' : 'label'}
        weight="medium"
      >
        {label}
      </Text>
    </Box>
  );
}

/*** Render a rail/sidebar Navigator tab item. */
function renderVerticalNavigatorTabItem(
  { active, badge, compact, icon, label }: NavigatorTabItemContentInput,
  colors: NavigatorTabItemColors,
) {
  return (
    <Box
      bg={colors.backgroundColor}
      px="m"
      py={compact ? 's' : 'm'}
      radius="m"
      style={styles.verticalContent}
    >
      {icon ? (
        <Box mr="s">
          <Icon {...icon} color={colors.contentColor} size={compact ? 's' : 'm'} />
        </Box>
      ) : null}
      <Box flex={1}>
        <Text
          color={active ? 'primary' : undefined}
          emphasis={active ? 'default' : 'muted'}
          numberOfLines={1}
          variant={compact ? 'bodySmall' : 'body'}
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
  verticalContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

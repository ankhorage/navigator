import {
  Box,
  ButtonBase,
  Icon,
  type IconSource,
  Text,
  type SurfaceTheme,
  useTheme,
} from '@ankhorage/surface';
import type { ReactNode } from 'react';
import { View } from 'react-native';

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
      style={horizontal ? { flex: 1 } : undefined}
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

interface NavigatorTabItemContentInput
  extends Omit<NavigatorTabItemProps, 'onPress' | 'orientation' | 'testID'> {
  horizontal: boolean;
  state: NavigatorTabItemRenderState;
  theme: SurfaceTheme;
}

/*** Render the tab trigger content for horizontal or vertical Navigator presentations. */
function renderNavigatorTabItemContent({
  active,
  badge,
  compact,
  horizontal,
  icon,
  label,
  state,
  theme,
}: NavigatorTabItemContentInput) {
  const colors = resolveNavigatorTabItemColors(theme, active, state);
  const iconSpacing = horizontal
    ? { marginBottom: label ? theme.spacing.xs : 0 }
    : { marginRight: theme.spacing.s };

  return (
    <Box
      px="m"
      py={compact ? 's' : 'm'}
      radius={horizontal ? undefined : 'm'}
      style={{
        alignItems: 'center',
        backgroundColor: colors.backgroundColor,
        flex: horizontal ? 1 : undefined,
        flexDirection: horizontal ? 'column' : 'row',
        justifyContent: horizontal ? 'center' : undefined,
      }}
    >
      {icon ? (
        <View style={iconSpacing}>
          <Icon {...icon} color={colors.contentColor} size={compact ? 's' : 'm'} />
        </View>
      ) : null}
      <Box flex={horizontal ? undefined : 1}>
        <Text
          color={active ? 'primary' : undefined}
          emphasis={active ? 'default' : 'muted'}
          numberOfLines={1}
          variant={horizontal ? (compact ? 'bodySmall' : 'label') : compact ? 'bodySmall' : 'body'}
          weight="medium"
        >
          {label}
        </Text>
      </Box>
      {!horizontal && badge ? <View style={{ marginLeft: theme.spacing.s }}>{badge}</View> : null}
    </Box>
  );
}

/*** Resolve Navigator tab colors from the current Surface theme interaction tokens. */
function resolveNavigatorTabItemColors(
  theme: SurfaceTheme,
  active: boolean,
  state: NavigatorTabItemRenderState,
) {
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

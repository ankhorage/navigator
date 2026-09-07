import { SplitView } from 'expo-router/unstable-split-view';

import { InspectorScreen as NavigatorInspectorScreen } from '@/screens/inspector-screen';
import { PrimaryColumnScreen as NavigatorPrimaryScreen } from '@/screens/primary-column-screen';
import { SupplementaryColumnScreen as NavigatorSupplementaryScreen } from '@/screens/supplementary-column-screen';

export default function NavigatorLayout() {
  return (
    <SplitView showInspector>
      <SplitView.Column>
        <NavigatorPrimaryScreen />
      </SplitView.Column>
      <SplitView.Column>
        <NavigatorSupplementaryScreen />
      </SplitView.Column>
      <SplitView.Inspector>
        <NavigatorInspectorScreen />
      </SplitView.Inspector>
    </SplitView>
  );
}

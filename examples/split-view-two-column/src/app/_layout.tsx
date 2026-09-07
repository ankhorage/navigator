import { SplitView } from 'expo-router/unstable-split-view';

import { PrimaryColumnScreen as NavigatorPrimaryScreen } from '@/screens/primary-column-screen';

export default function NavigatorLayout() {
  return (
    <SplitView>
      <SplitView.Column>
        <NavigatorPrimaryScreen />
      </SplitView.Column>
    </SplitView>
  );
}

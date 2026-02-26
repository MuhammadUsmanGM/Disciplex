import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function InsightsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Insights</ThemedText>
      <ThemedText>Analytics and Weekly Reckoning</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});

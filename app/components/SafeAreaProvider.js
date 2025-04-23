import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { theme } from '../utils/theme';

export const SafeAreaProvider = ({ children }) => {
  const insets = Platform.select({
    ios: {
      paddingTop: 0,
    },
    android: {
      paddingTop: StatusBar.currentHeight,
    },
  });

  return (
    <SafeAreaView style={[styles.container, insets]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        translucent
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
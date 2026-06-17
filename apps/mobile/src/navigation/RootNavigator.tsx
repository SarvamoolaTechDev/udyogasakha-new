import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/auth.store';
import { C } from '@/theme/colors';
import { AuthNavigator } from './AuthNavigator';
import { MemberTabNavigator } from './MemberTabNavigator';
import { ModeratorTabNavigator } from './ModeratorTabNavigator';

const Root = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary:        C.gold2,
    background:     C.deep,
    card:           C.cardBg,
    text:           C.white,
    border:         C.border,
    notification:   C.gold2,
  },
};

export function RootNavigator() {
  const { isAuthenticated, isModerator, hydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: C.deep, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.gold2} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : isModerator ? (
          <Root.Screen name="ModApp" component={ModeratorTabNavigator} />
        ) : (
          <Root.Screen name="MemberApp" component={MemberTabNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

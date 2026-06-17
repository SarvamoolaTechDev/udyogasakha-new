import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { C } from '@/theme/colors';
import { HomeScreen }            from '@/screens/member/HomeScreen';
import { JobsScreen }            from '@/screens/member/JobsScreen';
import { JobDetailScreen }       from '@/screens/member/JobDetailScreen';
import { ProfileHubScreen }      from '@/screens/member/ProfileHubScreen';
import { RoleProfileScreen }     from '@/screens/member/RoleProfileScreen';
import { SettingsScreen }        from '@/screens/member/SettingsScreen';
import { ModerationQueueScreen } from '@/screens/moderator/ModerationQueueScreen';
import { ProfileReviewScreen }   from '@/screens/moderator/ProfileReviewScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerOpts = { headerStyle: { backgroundColor: C.cardBg }, headerTintColor: C.white, headerTitleStyle: { fontSize: 15, fontWeight: '600' as const } };

function JobsStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="JobsList"  component={JobsScreen}      options={{ title: 'Browse Jobs' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Details' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="ProfileHub"  component={ProfileHubScreen}  options={{ title: 'My Profile' }} />
      <Stack.Screen name="RoleProfile" component={RoleProfileScreen} options={{ title: 'Role Profile' }} />
    </Stack.Navigator>
  );
}

function ModerationStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen name="ModerationQueue" component={ModerationQueueScreen} options={{ title: '🛡️ Moderation' }} />
      <Stack.Screen name="ProfileReview"   component={ProfileReviewScreen}   options={{ title: 'Review Profile' }} />
    </Stack.Navigator>
  );
}

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export function ModeratorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: C.cardBg, borderTopColor: C.border, paddingBottom: 6, height: 60 },
        tabBarActiveTintColor:   C.gold2,
        tabBarInactiveTintColor: C.faint,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tab.Screen name="Home"       component={HomeScreen}      options={{ title: 'Home',    tabBarIcon: icon('🏠') }} />
      <Tab.Screen name="Jobs"       component={JobsStack}       options={{ title: 'Jobs',    tabBarIcon: icon('🔍') }} />
      <Tab.Screen name="Moderation" component={ModerationStack} options={{ title: 'Moderate',tabBarIcon: icon('🛡️'), tabBarBadgeStyle: { backgroundColor: C.err } }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack}    options={{ title: 'Profile', tabBarIcon: icon('👤') }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}  options={{ title: 'Settings',tabBarIcon: icon('⚙️'), headerShown: true, headerStyle: { backgroundColor: C.cardBg }, headerTintColor: C.white, headerTitle: 'Settings' }} />
    </Tab.Navigator>
  );
}

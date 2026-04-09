import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FollowingScreen from '../screens/FollowingScreen';
import ForYouScreen from '../screens/ForYouScreen';

const Tab = createMaterialTopTabNavigator();

function TabLabel({ label, focused }) {
  return (
    <View style={styles.labelWrap}>
      <Text
        style={[
          styles.labelText,
          {
            color: focused ? '#fff' : 'rgba(255,255,255,0.65)',
            fontWeight: focused ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.underline,
          { backgroundColor: focused ? '#fff' : 'transparent' },
        ]}
      />
    </View>
  );
}

export default function HomeTopTabs() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      {/* LIVE (left) and Search (right) icons over the tab bar */}
      <View
        pointerEvents="box-none"
        style={[styles.overlayRow, { top: insets.top + 12 }]}
      >
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="tv-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <View pointerEvents="none" style={{ flex: 1 }} />
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        initialRouteName="ForYou"
        tabBarPosition="top"
        screenOptions={{
          swipeEnabled: true,
          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            marginTop: insets.top,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 10,
          },
          tabBarIndicatorStyle: { height: 0 },
          tabBarItemStyle: { width: 110 },
          tabBarContentContainerStyle: { justifyContent: 'center' },
        }}
        style={{ backgroundColor: '#000' }}
        sceneContainerStyle={{ backgroundColor: '#000' }}
      >
        <Tab.Screen
          name="Following"
          component={FollowingScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Following" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ForYou"
          component={ForYouScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="For You" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  overlayRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 17,
  },
  underline: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginTop: 5,
  },
});

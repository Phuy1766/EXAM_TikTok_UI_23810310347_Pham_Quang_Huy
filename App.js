import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';

import HomeTopTabs from './src/navigation/HomeTopTabs';
import CommentsScreen from './src/screens/CommentsScreen';

const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );
}

const DiscoverScreen = () => <PlaceholderScreen title="Discover" />;
const CreateScreen = () => <PlaceholderScreen title="Create" />;
const MeScreen = () => <PlaceholderScreen title="Me" />;

function CreateButton() {
  return (
    <View style={styles.createBtn}>
      <View style={[styles.createLayer, { backgroundColor: '#25F4EE', left: -5 }]} />
      <View style={[styles.createLayer, { backgroundColor: '#FE2C55', left: 5 }]} />
      <View style={styles.createCenter}>
        <Feather name="plus" size={26} color="#000" />
      </View>
    </View>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#000' },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: true,
              tabBarStyle: {
                backgroundColor: '#000',
                borderTopWidth: 0,
                height: 84,
                paddingTop: 8,
              },
              tabBarActiveTintColor: '#fff',
              tabBarInactiveTintColor: '#fff',
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '600',
                marginTop: 2,
              },
              tabBarIcon: ({ focused }) => {
                const s = 26;
                if (route.name === 'Home') {
                  return (
                    <FontAwesome5
                      name="home"
                      size={s}
                      color="#fff"
                      solid={focused}
                    />
                  );
                }
                if (route.name === 'Discover') {
                  return <Ionicons name="search" size={s} color="#fff" />;
                }
                if (route.name === 'Inbox') {
                  return (
                    <Ionicons
                      name={focused ? 'chatbubble' : 'chatbubble-outline'}
                      size={s}
                      color="#fff"
                    />
                  );
                }
                if (route.name === 'Me') {
                  return (
                    <Ionicons
                      name={focused ? 'person' : 'person-outline'}
                      size={s}
                      color="#fff"
                    />
                  );
                }
                return null;
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeTopTabs} />
            <Tab.Screen name="Discover" component={DiscoverScreen} />
            <Tab.Screen
              name="Create"
              component={CreateScreen}
              options={{
                tabBarLabel: '',
                tabBarIcon: () => <CreateButton />,
              }}
            />
            <Tab.Screen
              name="Inbox"
              component={CommentsScreen}
              options={{ tabBarLabel: 'Inbox' }}
            />
            <Tab.Screen name="Me" component={MeScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#fff', fontSize: 20 },
  createBtn: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createLayer: {
    position: 'absolute',
    width: 44,
    height: 32,
    borderRadius: 9,
  },
  createCenter: {
    width: 44,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

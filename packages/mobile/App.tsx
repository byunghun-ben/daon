import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/app/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
    </>
  );
}

export default App;
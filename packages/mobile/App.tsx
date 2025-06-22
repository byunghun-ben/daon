import React from "react";
import { StatusBar } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/app/navigation/AppNavigator";
import { queryClient } from "./src/shared/lib/queryClient";

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
    </QueryClientProvider>
  );
}

export default App;

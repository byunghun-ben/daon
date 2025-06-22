import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";

// Navigation Stack Param Lists
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  CreateChild: undefined;
  JoinChild: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Diary: undefined;
  Growth: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  ChildrenList: undefined;
  ChildProfile: { childId?: string };
  RecordActivity: { activityType: string };
  ActivityList: undefined;
  WriteDiary: undefined;
  DiaryList: undefined;
  GrowthChart: undefined;
  AddGrowthRecord: undefined;
};

export type MainStackParamList = AppStackParamList;

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: StackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

export type MainScreenProps<T extends keyof MainStackParamList> = {
  navigation: StackNavigationProp<MainStackParamList, T>;
  route: RouteProp<MainStackParamList, T>;
};

export type RootScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
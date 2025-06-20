import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  RouteProp,
} from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

// Auth Navigator 파라미터 타입
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

// Main Tab Navigator 파라미터 타입
export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Diary: undefined;
  Growth: undefined;
  Settings: undefined;
};

// App Stack Navigator 파라미터 타입
export type AppStackParamList = {
  MainTabs: undefined;

  // Child Management
  ChildrenList: undefined;
  ChildProfile: { childId: string };

  // Activity
  RecordActivity: { childId?: string };
  ActivityList: { childId?: string };

  // Diary
  WriteDiary: { childId?: string; entryId?: string };
  DiaryList: { childId?: string };

  // Growth
  GrowthChart: { childId?: string };
  AddGrowthRecord: { childId?: string };
};

// Combined navigation types
export type AppNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AppStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;

// Screen component props
export type AppScreenProps<T extends keyof AppStackParamList> = {
  navigation: AppNavigationProp;
  route: RouteProp<AppStackParamList, T>;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: AuthNavigationProp;
  route: RouteProp<AuthStackParamList, T>;
};

export type TabScreenProps<T extends keyof MainTabParamList> = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    AppNavigationProp
  >;
  route: RouteProp<MainTabParamList, T>;
};

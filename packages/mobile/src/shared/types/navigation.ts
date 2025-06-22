import type { StackNavigationProp } from "@react-navigation/stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RouteProp, NavigationProp } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";

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
  // Children Management
  ChildrenList: undefined;
  ChildProfile: {
    childId?: string;
    isEditing?: boolean;
    isFirstChild?: boolean; // For 2-step registration
  };
  // Activity Recording
  RecordActivity: {
    activityType: string;
    childId?: string;
    activityId?: string;
    isEditing?: boolean;
  };
  ActivityList: {
    childId?: string;
  };
  // Diary
  WriteDiary: {
    childId?: string;
    diaryId?: string;
    isEditing?: boolean;
  };
  DiaryList: {
    childId?: string;
  };
  // Growth
  GrowthChart: {
    childId?: string;
  };
  AddGrowthRecord: {
    childId?: string;
    recordId?: string;
    isEditing?: boolean;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Screen Props Types for Auth Stack
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: StackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

// Screen Props Types for App Stack (with ability to navigate to Tab)
export type AppScreenProps<T extends keyof AppStackParamList> = {
  navigation: CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, T>,
    BottomTabNavigationProp<MainTabParamList>
  >;
  route: RouteProp<AppStackParamList, T>;
};

// Screen Props Types for Main Tab (with ability to navigate to App Stack)
export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    StackNavigationProp<AppStackParamList>
  >;
  route: RouteProp<MainTabParamList, T>;
};

// Screen Props Types for Root
export type RootScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

// 특정 스크린별 Props 타입 정의
export type SignInScreenProps = AuthScreenProps<"SignIn">;
export type SignUpScreenProps = AuthScreenProps<"SignUp">;
export type CreateChildScreenProps = AuthScreenProps<"CreateChild">;
export type JoinChildScreenProps = AuthScreenProps<"JoinChild">;

export type HomeScreenProps = MainTabScreenProps<"Home">;
export type RecordScreenProps = MainTabScreenProps<"Record">;
export type DiaryScreenProps = MainTabScreenProps<"Diary">;
export type GrowthScreenProps = MainTabScreenProps<"Growth">;
export type SettingsScreenProps = MainTabScreenProps<"Settings">;

export type ChildrenListScreenProps = AppScreenProps<"ChildrenList">;
export type ChildProfileScreenProps = AppScreenProps<"ChildProfile">;
export type RecordActivityScreenProps = AppScreenProps<"RecordActivity">;
export type ActivityListScreenProps = AppScreenProps<"ActivityList">;
export type WriteDiaryScreenProps = AppScreenProps<"WriteDiary">;
export type DiaryListScreenProps = AppScreenProps<"DiaryList">;
export type GrowthChartScreenProps = AppScreenProps<"GrowthChart">;
export type AddGrowthRecordScreenProps = AppScreenProps<"AddGrowthRecord">;

// Composite navigation props (앱 내에서 다른 스택으로 네비게이션할 때 사용)
export type CompositeScreenProps<
  T extends keyof AppStackParamList | keyof MainTabParamList
> = T extends keyof AppStackParamList
  ? AppScreenProps<T>
  : T extends keyof MainTabParamList
  ? MainTabScreenProps<T>
  : never;

import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "@daon:theme_mode";

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    loadThemePreference();
    
    // 시스템 테마 변경 감지
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === "dark" ? "dark" : "light");
    });

    // 초기 시스템 테마 설정
    setSystemTheme(Appearance.getColorScheme() === "dark" ? "dark" : "light");

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        setSelectedTheme(stored as ThemeMode);
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
    }
  };

  const saveThemePreference = async (theme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setSelectedTheme(theme);
      
      // 여기서 실제 테마 변경 로직을 구현해야 함
      // 현재는 알림으로 대체
      Alert.alert(
        "테마 변경",
        `${getThemeDisplayName(theme)} 테마로 변경되었습니다.`,
        [{ text: "확인" }]
      );
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      Alert.alert("오류", "테마 설정 저장에 실패했습니다.");
    }
  };

  const getThemeDisplayName = (theme: ThemeMode) => {
    switch (theme) {
      case "light": return "라이트 모드";
      case "dark": return "다크 모드";
      case "system": return "시스템 설정";
      default: return theme;
    }
  };

  const getCurrentThemeStatus = () => {
    if (selectedTheme === "system") {
      return `시스템 설정 (현재: ${systemTheme === "dark" ? "다크" : "라이트"})`;
    }
    return getThemeDisplayName(selectedTheme);
  };

  const ThemeOption = ({ 
    theme, 
    title, 
    description, 
    icon 
  }: {
    theme: ThemeMode;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const isSelected = selectedTheme === theme;
    
    return (
      <TouchableOpacity
        onPress={() => saveThemePreference(theme)}
        className={`flex-row items-center p-4 rounded-lg border-2 mb-3 ${
          isSelected 
            ? "border-primary bg-primary/10" 
            : "border-gray-200 bg-white"
        }`}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
          isSelected ? "bg-primary" : "bg-gray-100"
        }`}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isSelected ? "white" : "#666"} 
          />
        </View>
        
        <View className="flex-1">
          <Text className={`text-base font-medium ${
            isSelected ? "text-primary" : "text-text"
          }`}>
            {title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {description}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "테마 설정",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView className="flex-1 bg-background">
        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* 현재 테마 상태 */}
          <Card className="p-4 mb-6">
            <Text className="text-lg font-semibold mb-2">현재 테마</Text>
            <Text className="text-base text-gray-700">
              {getCurrentThemeStatus()}
            </Text>
          </Card>

          {/* 테마 선택 옵션 */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-4">테마 선택</Text>
            
            <ThemeOption
              theme="light"
              title="라이트 모드"
              description="밝은 배경과 어두운 텍스트 사용"
              icon="sunny"
            />
            
            <ThemeOption
              theme="dark"
              title="다크 모드"
              description="어두운 배경과 밝은 텍스트 사용"
              icon="moon"
            />
            
            <ThemeOption
              theme="system"
              title="시스템 설정"
              description="기기의 시스템 설정을 따름"
              icon="settings"
            />
          </View>

          {/* 테마 정보 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-3">테마 정보</Text>
            
            <View className="gap-3">
              <View className="flex-row items-center">
                <Ionicons name="eye" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2">
                  다크 모드는 눈의 피로를 줄여줍니다
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="battery-charging" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2">
                  OLED 디스플레이에서 배터리 절약 효과
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="sync" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2">
                  시스템 설정은 자동으로 시간에 따라 변경됩니다
                </Text>
              </View>
            </View>
          </Card>

          {/* 테마 미리보기 */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-4">테마 미리보기</Text>
            
            <View className="flex-row gap-3">
              {/* 라이트 모드 미리보기 */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">라이트 모드</Text>
                <View className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <View className="bg-gray-100 h-3 rounded mb-2" />
                  <View className="bg-gray-200 h-2 rounded mb-1" />
                  <View className="bg-gray-200 h-2 rounded w-3/4" />
                </View>
              </View>
              
              {/* 다크 모드 미리보기 */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">다크 모드</Text>
                <View className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-sm">
                  <View className="bg-gray-700 h-3 rounded mb-2" />
                  <View className="bg-gray-600 h-2 rounded mb-1" />
                  <View className="bg-gray-600 h-2 rounded w-3/4" />
                </View>
              </View>
            </View>
          </View>

          {/* 추가 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              💡 테마 설정 팁
            </Text>
            <Text className="text-sm text-blue-700">
              • 시스템 설정을 선택하면 일몰/일출 시간에 자동으로 테마가 변경됩니다{"\n"}
              • 다크 모드는 저조도 환경에서 더 편안한 사용이 가능합니다{"\n"}
              • 테마 변경 후 앱을 다시 시작하면 완전히 적용됩니다
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
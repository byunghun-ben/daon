import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AccessibilitySettings {
  fontSize: "small" | "medium" | "large" | "xlarge";
  highContrast: boolean;
  reduceMotion: boolean;
  boldText: boolean;
  screenReader: boolean;
  vibrationFeedback: boolean;
  soundFeedback: boolean;
}

const ACCESSIBILITY_STORAGE_KEY = "@daon:accessibility_settings";

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    boldText: false,
    screenReader: false,
    vibrationFeedback: true,
    soundFeedback: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load accessibility settings:", error);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    try {
      await AsyncStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save accessibility settings:", error);
    }
  };

  const handleToggle = (key: keyof AccessibilitySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleFontSizeChange = (size: AccessibilitySettings["fontSize"]) => {
    const newSettings = { ...settings, fontSize: size };
    saveSettings(newSettings);
  };

  const getFontSizeDisplayName = (size: AccessibilitySettings["fontSize"]) => {
    switch (size) {
      case "small": return "작게";
      case "medium": return "보통";
      case "large": return "크게";
      case "xlarge": return "매우 크게";
      default: return size;
    }
  };

  const SettingToggle = ({ 
    title, 
    description, 
    value, 
    onToggle,
    icon
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={20} color="#666" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-text">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#767577", true: "#34D399" }}
        thumbColor={value ? "#10B981" : "#f4f3f4"}
      />
    </View>
  );

  const FontSizeOption = ({ 
    size, 
    label, 
    preview 
  }: {
    size: AccessibilitySettings["fontSize"];
    label: string;
    preview: string;
  }) => {
    const isSelected = settings.fontSize === size;
    
    return (
      <TouchableOpacity
        onPress={() => handleFontSizeChange(size)}
        className={`flex-row items-center justify-between p-4 rounded-lg border mb-3 ${
          isSelected 
            ? "border-primary bg-primary/10" 
            : "border-gray-200 bg-white"
        }`}
      >
        <View className="flex-1">
          <Text className={`font-medium ${
            isSelected ? "text-primary" : "text-text"
          }`}>
            {label}
          </Text>
          <Text className={`mt-1 text-gray-600 ${
            size === "small" ? "text-sm" :
            size === "medium" ? "text-base" :
            size === "large" ? "text-lg" :
            "text-xl"
          }`}>
            {preview}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        )}
      </TouchableOpacity>
    );
  };

  const Divider = () => <View className="h-px bg-gray-200 my-2" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "접근성",
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
          {/* 폰트 크기 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">폰트 크기</Text>
            
            <FontSizeOption
              size="small"
              label="작게"
              preview="작은 글씨 미리보기"
            />
            
            <FontSizeOption
              size="medium"
              label="보통"
              preview="보통 글씨 미리보기"
            />
            
            <FontSizeOption
              size="large"
              label="크게"
              preview="큰 글씨 미리보기"
            />
            
            <FontSizeOption
              size="xlarge"
              label="매우 크게"
              preview="매우 큰 글씨 미리보기"
            />
          </Card>

          {/* 시각적 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">시각적 설정</Text>
            
            <SettingToggle
              title="고대비 모드"
              description="텍스트와 배경의 대비를 높여 가독성 향상"
              value={settings.highContrast}
              onToggle={() => handleToggle("highContrast")}
              icon="contrast"
            />
            
            <Divider />
            
            <SettingToggle
              title="굵은 텍스트"
              description="모든 텍스트를 굵게 표시"
              value={settings.boldText}
              onToggle={() => handleToggle("boldText")}
              icon="text"
            />
            
            <Divider />
            
            <SettingToggle
              title="모션 줄이기"
              description="애니메이션과 전환 효과 최소화"
              value={settings.reduceMotion}
              onToggle={() => handleToggle("reduceMotion")}
              icon="speedometer"
            />
          </Card>

          {/* 스크린 리더 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">스크린 리더</Text>
            
            <SettingToggle
              title="스크린 리더 최적화"
              description="VoiceOver 및 TalkBack 사용 최적화"
              value={settings.screenReader}
              onToggle={() => handleToggle("screenReader")}
              icon="volume-high"
            />
            
            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">
                • iOS: 설정 > 손쉬운 사용 > VoiceOver{"\n"}
                • Android: 설정 > 접근성 > TalkBack
              </Text>
            </View>
          </Card>

          {/* 피드백 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">피드백 설정</Text>
            
            <SettingToggle
              title="진동 피드백"
              description="터치 및 상호작용 시 진동 피드백 제공"
              value={settings.vibrationFeedback}
              onToggle={() => handleToggle("vibrationFeedback")}
              icon="phone-portrait"
            />
            
            <Divider />
            
            <SettingToggle
              title="소리 피드백"
              description="버튼 클릭 및 상호작용 시 소리 피드백"
              value={settings.soundFeedback}
              onToggle={() => handleToggle("soundFeedback")}
              icon="musical-notes"
            />
          </Card>

          {/* 현재 설정 요약 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-3">현재 설정</Text>
            
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">폰트 크기</Text>
                <Text className="text-sm font-medium">
                  {getFontSizeDisplayName(settings.fontSize)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">고대비 모드</Text>
                <Text className="text-sm font-medium">
                  {settings.highContrast ? "켜짐" : "꺼짐"}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">모션 줄이기</Text>
                <Text className="text-sm font-medium">
                  {settings.reduceMotion ? "켜짐" : "꺼짐"}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">스크린 리더 최적화</Text>
                <Text className="text-sm font-medium">
                  {settings.screenReader ? "켜짐" : "꺼짐"}
                </Text>
              </View>
            </View>
          </Card>

          {/* 추가 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              💡 접근성 설정 팁
            </Text>
            <Text className="text-sm text-blue-700">
              • 시스템 설정에서 추가 접근성 기능을 활성화할 수 있습니다{"\n"}
              • 스크린 리더 사용 시 음성 안내를 받을 수 있습니다{"\n"}
              • 설정 변경 후 앱을 다시 시작하면 완전히 적용됩니다
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
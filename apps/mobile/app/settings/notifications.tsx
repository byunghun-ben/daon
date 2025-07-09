import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationSettings {
  pushNotifications: boolean;
  feedingReminders: boolean;
  sleepReminders: boolean;
  milestoneAlerts: boolean;
  growthTracking: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: boolean;
  quietStartTime: string;
  quietEndTime: string;
}

const STORAGE_KEY = "@daon:notification_settings";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    feedingReminders: true,
    sleepReminders: true,
    milestoneAlerts: true,
    growthTracking: true,
    dailySummary: true,
    weeklyReport: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: false,
    quietStartTime: "22:00",
    quietEndTime: "07:00",
  });

  const [permissionStatus, setPermissionStatus] = useState<string>("undetermined");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissionStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    }
  };

  const checkPermissionStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === "granted") {
        Alert.alert("알림 권한 허용", "알림 설정이 활성화되었습니다.");
      } else {
        Alert.alert(
          "알림 권한 거부",
          "알림을 받으려면 설정 앱에서 알림 권한을 허용해주세요."
        );
      }
    } catch (error) {
      Alert.alert("오류", "알림 권한 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleOpenSystemSettings = () => {
    Alert.alert(
      "시스템 설정",
      "알림 설정을 변경하려면 시스템 설정으로 이동하세요.",
      [
        { text: "취소", style: "cancel" },
        { text: "설정 열기", onPress: () => {
          if (Platform.OS === "ios") {
            // iOS에서는 앱 설정으로 직접 이동
            // Linking.openURL("app-settings:");
          } else {
            // Android에서는 앱 정보 화면으로 이동
            // Linking.openURL("package:com.yourpackage.name");
          }
        }},
      ]
    );
  };

  const SettingToggle = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    disabled = false 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }) => (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-1 pr-4">
        <Text className={`text-base font-medium ${disabled ? "text-gray-400" : "text-text"}`}>
          {title}
        </Text>
        <Text className={`text-sm mt-1 ${disabled ? "text-gray-300" : "text-gray-500"}`}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#767577", true: "#34D399" }}
        thumbColor={value ? "#10B981" : "#f4f3f4"}
      />
    </View>
  );

  const Divider = () => <View className="h-px bg-gray-200 my-2" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "알림 설정",
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
          {/* 알림 권한 상태 */}
          <Card className="p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold">알림 권한</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {permissionStatus === "granted" 
                    ? "알림 권한이 허용되었습니다"
                    : "알림을 받으려면 권한을 허용해주세요"
                  }
                </Text>
              </View>
              {permissionStatus !== "granted" && (
                <TouchableOpacity
                  onPress={requestPermission}
                  disabled={isLoading}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">
                    {isLoading ? "요청 중..." : "권한 허용"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {permissionStatus === "granted" && (
              <TouchableOpacity
                onPress={handleOpenSystemSettings}
                className="mt-3 py-2"
              >
                <Text className="text-primary text-sm">시스템 설정에서 상세 설정</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* 기본 알림 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">기본 알림</Text>
            
            <SettingToggle
              title="푸시 알림"
              description="모든 알림의 기본 설정"
              value={settings.pushNotifications}
              onToggle={() => handleToggle("pushNotifications")}
              disabled={permissionStatus !== "granted"}
            />
            
            <Divider />
            
            <SettingToggle
              title="소리"
              description="알림 소리 재생"
              value={settings.soundEnabled}
              onToggle={() => handleToggle("soundEnabled")}
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="진동"
              description="알림 진동 사용"
              value={settings.vibrationEnabled}
              onToggle={() => handleToggle("vibrationEnabled")}
              disabled={!settings.pushNotifications}
            />
          </Card>

          {/* 활동 알림 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">활동 알림</Text>
            
            <SettingToggle
              title="수유 리마인더"
              description="수유 시간 알림"
              value={settings.feedingReminders}
              onToggle={() => handleToggle("feedingReminders")}
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="수면 리마인더"
              description="수면 시간 알림"
              value={settings.sleepReminders}
              onToggle={() => handleToggle("sleepReminders")}
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="성장 추적"
              description="성장 기록 알림"
              value={settings.growthTracking}
              onToggle={() => handleToggle("growthTracking")}
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="이정표 알림"
              description="발달 이정표 알림"
              value={settings.milestoneAlerts}
              onToggle={() => handleToggle("milestoneAlerts")}
              disabled={!settings.pushNotifications}
            />
          </Card>

          {/* 요약 알림 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">요약 알림</Text>
            
            <SettingToggle
              title="일일 요약"
              description="매일 활동 요약 알림"
              value={settings.dailySummary}
              onToggle={() => handleToggle("dailySummary")}
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="주간 리포트"
              description="주간 성장 리포트 알림"
              value={settings.weeklyReport}
              onToggle={() => handleToggle("weeklyReport")}
              disabled={!settings.pushNotifications}
            />
          </Card>

          {/* 방해 금지 시간 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">방해 금지 시간</Text>
            
            <SettingToggle
              title="방해 금지 시간 사용"
              description="지정된 시간에는 알림 차단"
              value={settings.quietHours}
              onToggle={() => handleToggle("quietHours")}
              disabled={!settings.pushNotifications}
            />
            
            {settings.quietHours && (
              <View className="mt-4 p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  방해 금지 시간대
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600">시작 시간</Text>
                    <Text className="text-base font-medium">{settings.quietStartTime}</Text>
                  </View>
                  <Text className="text-gray-400 mx-3">~</Text>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600">종료 시간</Text>
                    <Text className="text-base font-medium">{settings.quietEndTime}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500 mt-2">
                  * 시간 설정은 추후 업데이트 예정
                </Text>
              </View>
            )}
          </Card>

          {/* 추가 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              💡 알림 설정 팁
            </Text>
            <Text className="text-sm text-blue-700">
              • 중요한 알림은 켜두고 불필요한 알림은 끄세요{"\n"}
              • 방해 금지 시간을 설정하여 휴식 시간을 보장하세요{"\n"}
              • 시스템 설정에서 더 세부적인 알림 설정이 가능합니다
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

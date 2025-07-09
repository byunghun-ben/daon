import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
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

interface SimpleNotificationSettings {
  pushNotifications: boolean;
  feedingReminders: boolean;
  sleepReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<SimpleNotificationSettings>({
    pushNotifications: true,
    feedingReminders: true,
    sleepReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const handleToggle = (key: keyof SimpleNotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const requestPermission = async () => {
    Alert.alert("알림 권한", "알림 권한을 허용해주세요.");
  };

  const SettingToggle = ({ 
    title, 
    description, 
    value, 
    onToggle,
    icon,
    disabled = false
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
  }) => (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={20} color={disabled ? "#CCC" : "#666"} />
        <View className="ml-3 flex-1">
          <Text className={`text-base font-medium ${disabled ? "text-gray-400" : "text-text"}`}>
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
          {/* 알림 권한 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">알림 권한</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-medium text-green-600">
                  알림 권한이 허용되었습니다
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  알림을 받을 수 있습니다
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            
            <TouchableOpacity
              onPress={requestPermission}
              className="mt-4 bg-blue-500 p-3 rounded-lg items-center"
            >
              <Text className="text-white font-medium">권한 설정 변경</Text>
            </TouchableOpacity>
          </Card>

          {/* 기본 알림 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">기본 알림</Text>
            
            <SettingToggle
              title="푸시 알림"
              description="모든 알림의 기본 설정"
              value={settings.pushNotifications}
              onToggle={() => handleToggle("pushNotifications")}
              icon="notifications"
            />
            
            <Divider />
            
            <SettingToggle
              title="소리"
              description="알림 소리 재생"
              value={settings.soundEnabled}
              onToggle={() => handleToggle("soundEnabled")}
              icon="volume-high"
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="진동"
              description="알림 진동 사용"
              value={settings.vibrationEnabled}
              onToggle={() => handleToggle("vibrationEnabled")}
              icon="phone-portrait"
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
              icon="restaurant"
              disabled={!settings.pushNotifications}
            />
            
            <Divider />
            
            <SettingToggle
              title="수면 리마인더"
              description="수면 시간 알림"
              value={settings.sleepReminders}
              onToggle={() => handleToggle("sleepReminders")}
              icon="bed"
              disabled={!settings.pushNotifications}
            />
          </Card>

          {/* 알림 설정 안내 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              💡 알림 설정 팁
            </Text>
            <Text className="text-sm text-blue-700">
              • 중요한 알림은 켜두고 불필요한 알림은 끄세요{"\n"}
              • 시스템 설정에서 더 세부적인 알림 설정이 가능합니다{"\n"}
              • 배터리 최적화 설정도 확인해보세요
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
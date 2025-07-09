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

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    dataCollection: true,
    analytics: false,
    crashReporting: true,
    personalizedAds: false,
    locationTracking: false,
    dataSharing: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportData = () => {
    Alert.alert(
      "데이터 내보내기",
      "사용자 데이터를 내보내시겠습니까? 이메일로 전송됩니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "내보내기", onPress: () => {
          Alert.alert("완료", "데이터 내보내기 요청이 처리되었습니다.");
        }}
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "계정 삭제",
      "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: () => {
          Alert.alert("알림", "계정 삭제가 요청되었습니다.");
        }}
      ]
    );
  };

  const SettingToggle = ({ 
    title, 
    description, 
    value, 
    onToggle,
    icon,
    warning = false
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    warning?: boolean;
  }) => (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={20} color={warning ? "#EF4444" : "#666"} />
        <View className="ml-3 flex-1">
          <Text className={`text-base font-medium ${warning ? "text-red-600" : "text-text"}`}>
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
        trackColor={{ false: "#767577", true: warning ? "#EF4444" : "#34D399" }}
        thumbColor={value ? (warning ? "#DC2626" : "#10B981") : "#f4f3f4"}
      />
    </View>
  );

  const Divider = () => <View className="h-px bg-gray-200 my-2" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "개인정보 보호",
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
          {/* 데이터 수집 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">데이터 수집 설정</Text>
            
            <SettingToggle
              title="기본 데이터 수집"
              description="서비스 제공에 필요한 기본 데이터 수집"
              value={settings.dataCollection}
              onToggle={() => handleToggle("dataCollection")}
              icon="document-text"
            />
            
            <Divider />
            
            <SettingToggle
              title="사용 분석"
              description="앱 사용 패턴 분석을 통한 서비스 개선"
              value={settings.analytics}
              onToggle={() => handleToggle("analytics")}
              icon="analytics"
            />
            
            <Divider />
            
            <SettingToggle
              title="오류 리포팅"
              description="앱 오류 및 충돌 정보 수집"
              value={settings.crashReporting}
              onToggle={() => handleToggle("crashReporting")}
              icon="bug"
            />
          </Card>

          {/* 개인화 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">개인화 설정</Text>
            
            <SettingToggle
              title="개인화된 광고"
              description="사용자 맞춤형 광고 표시"
              value={settings.personalizedAds}
              onToggle={() => handleToggle("personalizedAds")}
              icon="megaphone"
            />
            
            <Divider />
            
            <SettingToggle
              title="위치 추적"
              description="위치 기반 서비스 제공"
              value={settings.locationTracking}
              onToggle={() => handleToggle("locationTracking")}
              icon="location"
              warning={true}
            />
          </Card>

          {/* 데이터 공유 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">데이터 공유</Text>
            
            <SettingToggle
              title="제3자 데이터 공유"
              description="파트너사와의 데이터 공유"
              value={settings.dataSharing}
              onToggle={() => handleToggle("dataSharing")}
              icon="share"
              warning={true}
            />
            
            <View className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">
                * 데이터 공유를 해제하면 일부 기능이 제한될 수 있습니다.
              </Text>
            </View>
          </Card>

          {/* 데이터 관리 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">데이터 관리</Text>
            
            <TouchableOpacity
              onPress={handleExportData}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="download" size={20} color="#666" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-text">
                    데이터 내보내기
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    저장된 모든 데이터를 다운로드
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <Divider />
            
            <TouchableOpacity
              onPress={() => router.push("/legal/privacy")}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="document-text" size={20} color="#666" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-text">
                    개인정보 처리방침
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    개인정보 처리방침 전문 보기
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </Card>

          {/* 계정 삭제 */}
          <Card className="p-4 mb-4 border-red-200">
            <Text className="text-lg font-semibold mb-4 text-red-600">위험 구역</Text>
            
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="trash" size={20} color="#EF4444" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-red-600">
                    계정 삭제
                  </Text>
                  <Text className="text-sm text-red-500 mt-1">
                    모든 데이터가 영구적으로 삭제됩니다
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </Card>

          {/* 추가 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              🔐 개인정보 보호 안내
            </Text>
            <Text className="text-sm text-blue-700">
              • 개인정보 보호 설정은 언제든지 변경할 수 있습니다{"\n"}
              • 일부 기능은 데이터 수집 동의가 필요할 수 있습니다{"\n"}
              • 데이터 처리에 대한 자세한 내용은 개인정보 처리방침을 참조하세요
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
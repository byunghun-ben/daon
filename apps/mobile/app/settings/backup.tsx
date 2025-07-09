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

export default function BackupSyncScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    autoBackup: true,
    cloudSync: true,
    wifiOnly: true,
    includePhotos: true,
    includeVideos: false,
    compressionEnabled: true,
  });
  
  const [lastBackup] = useState(new Date());
  const [storageUsed] = useState(2.4); // GB

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleManualBackup = () => {
    Alert.alert(
      "수동 백업",
      "지금 데이터를 백업하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "백업 시작", onPress: () => {
          Alert.alert("백업 시작", "백업이 시작되었습니다. 완료되면 알림을 받으실 수 있습니다.");
        }}
      ]
    );
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      "백업 복원",
      "이전 백업으로 데이터를 복원하시겠습니까? 현재 데이터는 덮어씌워집니다.",
      [
        { text: "취소", style: "cancel" },
        { text: "복원", style: "destructive", onPress: () => {
          Alert.alert("복원 시작", "백업 복원이 시작되었습니다.");
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
          title: "백업 및 동기화",
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
          {/* 백업 상태 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">백업 상태</Text>
            
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600">마지막 백업</Text>
                <Text className="text-base font-medium">
                  {lastBackup.toLocaleString('ko-KR')}
                </Text>
              </View>
              <View className="w-3 h-3 bg-green-500 rounded-full" />
            </View>
            
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600">클라우드 저장소 사용량</Text>
                <Text className="text-base font-medium">
                  {storageUsed.toFixed(1)} GB / 15 GB
                </Text>
              </View>
              <View className="w-24 h-2 bg-gray-200 rounded-full">
                <View 
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${(storageUsed / 15) * 100}%` }}
                />
              </View>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleManualBackup}
                className="flex-1 bg-primary p-3 rounded-lg items-center"
              >
                <Ionicons name="cloud-upload" size={20} color="white" />
                <Text className="text-white font-medium mt-1">수동 백업</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRestoreBackup}
                className="flex-1 bg-gray-500 p-3 rounded-lg items-center"
              >
                <Ionicons name="cloud-download" size={20} color="white" />
                <Text className="text-white font-medium mt-1">백업 복원</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* 자동 백업 설정 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">자동 백업</Text>
            
            <SettingToggle
              title="자동 백업"
              description="정기적으로 데이터를 자동 백업"
              value={settings.autoBackup}
              onToggle={() => handleToggle("autoBackup")}
              icon="refresh"
            />
            
            <Divider />
            
            <SettingToggle
              title="클라우드 동기화"
              description="여러 기기 간 데이터 동기화"
              value={settings.cloudSync}
              onToggle={() => handleToggle("cloudSync")}
              icon="cloud"
              disabled={!settings.autoBackup}
            />
            
            <Divider />
            
            <SettingToggle
              title="WiFi 전용"
              description="WiFi 연결 시에만 백업"
              value={settings.wifiOnly}
              onToggle={() => handleToggle("wifiOnly")}
              icon="wifi"
              disabled={!settings.autoBackup}
            />
          </Card>

          {/* 백업 콘텐츠 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">백업 콘텐츠</Text>
            
            <SettingToggle
              title="사진 포함"
              description="일기 및 성장 기록 사진 백업"
              value={settings.includePhotos}
              onToggle={() => handleToggle("includePhotos")}
              icon="image"
            />
            
            <Divider />
            
            <SettingToggle
              title="동영상 포함"
              description="동영상 파일 백업 (용량 많이 사용)"
              value={settings.includeVideos}
              onToggle={() => handleToggle("includeVideos")}
              icon="videocam"
            />
            
            <Divider />
            
            <SettingToggle
              title="압축 사용"
              description="백업 파일 압축으로 용량 절약"
              value={settings.compressionEnabled}
              onToggle={() => handleToggle("compressionEnabled")}
              icon="archive"
            />
          </Card>

          {/* 백업 기록 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">백업 기록</Text>
            
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium">전체 백업</Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString('ko-KR')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-sm text-green-600 ml-1">완료</Text>
                </View>
              </View>
              
              <Divider />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium">증분 백업</Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString('ko-KR')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-sm text-green-600 ml-1">완료</Text>
                </View>
              </View>
              
              <Divider />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium">자동 백업</Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(Date.now() - 60 * 60 * 1000).toLocaleString('ko-KR')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text className="text-sm text-green-600 ml-1">완료</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* 기기 관리 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">연결된 기기</Text>
            
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="phone-portrait" size={20} color="#666" />
                  <View className="ml-3">
                    <Text className="text-base font-medium">iPhone 15 Pro</Text>
                    <Text className="text-sm text-gray-500">현재 기기</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-sm text-green-600">온라인</Text>
                </View>
              </View>
              
              <Divider />
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="tablet-portrait" size={20} color="#666" />
                  <View className="ml-3">
                    <Text className="text-base font-medium">iPad Pro</Text>
                    <Text className="text-sm text-gray-500">마지막 동기화: 2시간 전</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  <Text className="text-sm text-gray-600">오프라인</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* 추가 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              ☁️ 백업 및 동기화 안내
            </Text>
            <Text className="text-sm text-blue-700">
              • 자동 백업은 WiFi 연결 시에만 진행됩니다{"\n"}
              • 클라우드 저장소는 15GB까지 무료로 사용 가능합니다{"\n"}
              • 백업된 데이터는 암호화되어 안전하게 보관됩니다{"\n"}
              • 기기 간 동기화는 실시간으로 이루어집니다
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
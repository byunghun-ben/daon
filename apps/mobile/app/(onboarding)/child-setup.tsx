import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateChildForm, JoinChildForm } from "../../features/children";
import { useAuthStore } from "../../shared/store";

type TabType = "create" | "join";

export default function OnboardingChildSetupScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const { refreshAuth } = useAuthStore();

  const handleSuccess = async () => {
    // 사용자 정보 새로고침 (registration_status가 completed로 업데이트됨)
    await refreshAuth();

    // 온보딩 완료 후 메인 화면으로 이동
    console.log("[OnboardingChildSetupScreen] Redirecting to tabs");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-col items-center gap-2 py-6">
            <Text className="text-2xl font-bold">아이 프로필 만들기</Text>
            <Text className="text-lg font-medium text-gray-500 text-center">
              새로운 아이를 등록하거나{"\n"}
              기존 아이의 관리자로 참여하세요
            </Text>
          </View>

          <View className="flex flex-row bg-surface rounded-md max-w-screen-sm mx-auto mb-6 gap-2 px-6">
            <TouchableOpacity
              className={`flex-1 p-2 rounded-md items-center ${
                activeTab === "create" ? "bg-primary" : ""
              }`}
              onPress={() => setActiveTab("create")}
            >
              <Text
                className={`text-lg font-medium ${
                  activeTab === "create" ? "text-white" : "text-gray-500"
                }`}
              >
                새 아이 등록
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-2 rounded-md items-center ${
                activeTab === "join" ? "bg-primary" : ""
              }`}
              onPress={() => setActiveTab("join")}
            >
              <Text
                className={`text-lg font-medium ${
                  activeTab === "join" ? "text-white" : "text-gray-500"
                }`}
              >
                기존 아이 참여
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 flex-row bg-background max-w-screen-sm mx-auto px-6">
            {activeTab === "create" ? (
              <CreateChildForm onSuccess={handleSuccess} />
            ) : (
              <JoinChildForm onSuccess={handleSuccess} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

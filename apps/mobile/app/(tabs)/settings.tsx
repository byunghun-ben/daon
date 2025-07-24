import { useAuthStore } from "@/shared/store/authStore";
import { ButtonText, ButtonV2 } from "@/shared/ui/Button/ButtonV2";
import Card from "@/shared/ui/Card/Card";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">설정</Text>
        <Text className="text-sm text-gray-500">앱 설정 및 계정 관리</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 계정 설정 */}
        <View className="p-6 gap-2">
          <Text className="text-xl font-bold">계정</Text>
          <Card className="gap-2">
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/profile/edit")}
            >
              <Text className="text-lg font-bold mb-2">프로필 수정</Text>
              <Text className="text-sm text-gray-500">
                이름, 이메일 등 기본 정보 수정
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/children/list")}
            >
              <Text className="text-lg font-bold mb-2">아이 관리</Text>
              <Text className="text-sm text-gray-500">
                등록된 아이 정보 보기 및 수정
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 앱 설정 */}
        <View className="p-6 gap-2">
          <Text className="text-xl font-bold mb-4">앱 설정</Text>
          <Card className="gap-2">
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/settings/theme")}
            >
              <Text className="text-lg font-bold mb-2">테마 설정</Text>
              <Text className="text-sm text-gray-500">
                라이트/다크 모드 및 시스템 설정 따라가기
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/settings/accessibility")}
            >
              <Text className="text-lg font-bold mb-2">접근성</Text>
              <Text className="text-sm text-gray-500">
                폰트 크기, 고대비 모드, 모션 설정
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/settings/language")}
            >
              <Text className="text-lg font-bold mb-2">언어 설정</Text>
              <Text className="text-sm text-gray-500">앱 언어 변경</Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/settings/privacy")}
            >
              <Text className="text-lg font-bold mb-2">개인정보 보호</Text>
              <Text className="text-sm text-gray-500">
                데이터 보안 및 개인정보 설정
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/settings/backup")}
            >
              <Text className="text-lg font-bold mb-2">백업 및 동기화</Text>
              <Text className="text-sm text-gray-500">
                데이터 백업 및 기기 간 동기화
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 지원 */}
        <View className="p-6 gap-2">
          <Text className="text-xl font-bold">지원</Text>
          <Card className="gap-2">
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/support/help")}
            >
              <Text className="text-lg font-bold mb-2">도움말</Text>
              <Text className="text-sm text-gray-500">
                사용법 및 자주 묻는 질문
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/support/contact")}
            >
              <Text className="text-lg font-bold mb-2">문의하기</Text>
              <Text className="text-sm text-gray-500">
                버그 신고 및 기능 제안
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200" />
            <TouchableOpacity
              className="p-2"
              onPress={() => router.push("/about")}
            >
              <Text className="text-lg font-bold mb-2">앱 정보</Text>
              <Text className="text-sm text-gray-500">
                버전 정보 및 라이선스
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 로그아웃 */}
        <View className="p-6">
          <ButtonV2 onPress={handleLogout} variant="outline">
            <ButtonText>로그아웃</ButtonText>
          </ButtonV2>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

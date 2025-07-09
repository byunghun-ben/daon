import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { 
  Alert, 
  Linking, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenURL = (url: string) => {
    Linking.openURL(url);
  };

  const handleShowLicenses = () => {
    Alert.alert(
      "오픈소스 라이선스",
      "이 앱은 다음 오픈소스 라이브러리들을 사용합니다:\n\n• React Native\n• Expo\n• React Navigation\n• Zustand\n• TanStack Query\n• Zod\n• Tailwind CSS\n• 기타 라이브러리들",
      [{ text: "확인" }]
    );
  };

  const InfoRow = ({ 
    label, 
    value, 
    onPress 
  }: { 
    label: string; 
    value: string; 
    onPress?: () => void; 
  }) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!onPress}
      className="flex-row justify-between items-center py-3"
    >
      <Text className="text-sm text-gray-600">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-sm font-medium text-text mr-2">{value}</Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  const Divider = () => <View className="h-px bg-gray-200 my-1" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "앱 정보",
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
          {/* 앱 로고 및 이름 */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-4">
              <Ionicons name="heart" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-text mb-2">다온</Text>
            <Text className="text-base text-gray-600 text-center">
              아이와 함께하는 성장 기록 앱
            </Text>
          </View>

          {/* 앱 버전 정보 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">버전 정보</Text>
            
            <InfoRow 
              label="버전" 
              value={Application.nativeApplicationVersion || "1.0.0"} 
            />
            <Divider />
            
            <InfoRow 
              label="빌드 번호" 
              value={Application.nativeBuildVersion || "1"} 
            />
            <Divider />
            
            <InfoRow 
              label="번들 식별자" 
              value={Application.applicationId || "com.daon.app"} 
            />
          </Card>

          {/* 개발자 정보 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">개발자 정보</Text>
            
            <InfoRow 
              label="개발사" 
              value="다온 팀" 
            />
            <Divider />
            
            <InfoRow 
              label="이메일" 
              value="support@daon.app" 
              onPress={() => handleOpenURL("mailto:support@daon.app")}
            />
            <Divider />
            
            <InfoRow 
              label="웹사이트" 
              value="daon.app" 
              onPress={() => handleOpenURL("https://daon.app")}
            />
          </Card>

          {/* 지원 및 문의 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">지원 및 문의</Text>
            
            <InfoRow 
              label="문의하기" 
              value="이메일 보내기" 
              onPress={() => handleOpenURL("mailto:support@daon.app")}
            />
            <Divider />
            
            <InfoRow 
              label="FAQ" 
              value="자주 묻는 질문" 
              onPress={() => handleOpenURL("https://daon.app/faq")}
            />
            <Divider />
            
            <InfoRow 
              label="사용 가이드" 
              value="도움말 보기" 
              onPress={() => handleOpenURL("https://daon.app/guide")}
            />
          </Card>

          {/* 법적 정보 */}
          <Card className="p-4 in-4">
            <Text className="text-lg font-semibold mb-4">법적 정보</Text>
            
            <InfoRow 
              label="서비스 이용약관" 
              value="보기" 
              onPress={() => router.push("/legal/terms")}
            />
            <Divider />
            
            <InfoRow 
              label="개인정보 처리방침" 
              value="보기" 
              onPress={() => router.push("/legal/privacy")}
            />
            <Divider />
            
            <InfoRow 
              label="오픈소스 라이선스" 
              value="보기" 
              onPress={handleShowLicenses}
            />
          </Card>

          {/* 앱 스토어 평가 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-3">앱 평가</Text>
            <Text className="text-sm text-gray-600 mb-4">
              다온이 도움이 되셨나요? 앱 스토어에서 평가해주세요!
            </Text>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-primary p-3 rounded-lg items-center"
                onPress={() => {
                  // iOS App Store 리뷰 링크
                  handleOpenURL("https://apps.apple.com/app/daon");
                }}
              >
                <Ionicons name="logo-apple" size={20} color="white" />
                <Text className="text-white font-medium mt-1">App Store</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-green-500 p-3 rounded-lg items-center"
                onPress={() => {
                  // Google Play Store 리뷰 링크
                  handleOpenURL("https://play.google.com/store/apps/details?id=com.daon.app");
                }}
              >
                <Ionicons name="logo-google-playstore" size={20} color="white" />
                <Text className="text-white font-medium mt-1">Play Store</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* 앱 정보 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              📱 다온 앱 소개
            </Text>
            <Text className="text-sm text-blue-700">
              다온은 부모와 아이가 함께 성장할 수 있도록 돕는 종합 육아 앱입니다. 
              수유, 수면, 기저귀 교체 등 일상적인 육아 활동을 기록하고, 
              아이의 성장 과정을 체계적으로 관리할 수 있습니다.
            </Text>
          </View>

          {/* 저작권 정보 */}
          <View className="items-center py-6">
            <Text className="text-xs text-gray-500 text-center">
              © 2024 다온 팀. All rights reserved.
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-1">
              Made with ❤️ in Korea
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../shared/ui";

export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  const handleStartSetup = () => {
    router.push("/(onboarding)/child-setup");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1 bg-background p-4 justify-center items-center gap-6">
        <View className="flex flex-col items-center gap-4">
          <Text className="text-3xl font-bold">
            다온에 오신 것을 환영합니다!
          </Text>
          <Text className="text-lg font-medium text-gray-500 text-center">
            아이의 소중한 순간들을 기록하고{"\n"}
            성장 과정을 함께 나눠보세요
          </Text>
        </View>

        <Button
          title="아이 프로필 만들기"
          onPress={handleStartSetup}
          variant="primary"
        />
      </SafeAreaView>
    </>
  );
}

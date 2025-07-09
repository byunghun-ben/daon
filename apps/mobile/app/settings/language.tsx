import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Card from "@/shared/ui/Card/Card";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { SupportedLanguage } from "@/shared/lib/i18n";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { currentLanguage, changeLanguage, supportedLanguages, getLanguageInfo } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;

    const languageInfo = getLanguageInfo(language);
    
    Alert.alert(
      "언어를 변경하시겠습니까?",
      `${languageInfo.nativeName}로 변경합니다.`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "확인", 
          onPress: async () => {
            setIsChanging(true);
            try {
              const success = await changeLanguage(language);
              if (success) {
                Alert.alert("성공", "언어가 변경되었습니다.");
              } else {
                Alert.alert("오류", "언어 변경에 실패했습니다.");
              }
            } finally {
              setIsChanging(false);
            }
          }
        }
      ]
    );
  };

  const LanguageOption = ({ 
    language,
    info 
  }: { 
    language: SupportedLanguage;
    info: typeof supportedLanguages[SupportedLanguage];
  }) => {
    const isSelected = language === currentLanguage;
    
    return (
      <TouchableOpacity
        onPress={() => handleLanguageChange(language)}
        disabled={isChanging || isSelected}
        className={`flex-row items-center justify-between p-4 ${
          isSelected ? "bg-blue-50" : ""
        }`}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{info.flag}</Text>
          <View>
            <Text className={`text-base font-medium ${
              isSelected ? "text-blue-600" : "text-gray-900"
            }`}>
              {info.nativeName}
            </Text>
            <Text className="text-sm text-gray-500">{info.name}</Text>
          </View>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
        )}
      </TouchableOpacity>
    );
  };

  const Divider = () => <View className="h-px bg-gray-200" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "언어 설정",
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
          {/* 현재 언어 */}
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">
              현재 언어
            </Text>
            
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">
                {getLanguageInfo(currentLanguage).flag}
              </Text>
              <View>
                <Text className="text-base font-medium text-blue-600">
                  {getLanguageInfo(currentLanguage).nativeName}
                </Text>
                <Text className="text-sm text-gray-500">
                  {getLanguageInfo(currentLanguage).name}
                </Text>
              </View>
            </View>
          </Card>

          {/* 사용 가능한 언어 */}
          <Card className="mb-4">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                사용 가능한 언어
              </Text>
            </View>
            
            {Object.entries(supportedLanguages).map(([lang, info], index, array) => (
              <View key={lang}>
                <LanguageOption 
                  language={lang as SupportedLanguage} 
                  info={info} 
                />
                {index < array.length - 1 && <Divider />}
              </View>
            ))}
          </Card>

          {/* 언어 변경 안내 */}
          <View className="p-4 bg-blue-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              🌐 언어 설정
            </Text>
            <Text className="text-sm text-blue-700">
              언어를 변경하면 앱의 모든 텍스트가 선택한 언어로 표시됩니다.{"\n"}
              언어 변경은 즉시 적용되며 앱을 재시작할 필요가 없습니다.{"\n"}
              일부 사용자 입력 데이터는 원래 언어로 유지됩니다.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
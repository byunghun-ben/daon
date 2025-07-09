import Card from "@/shared/ui/Card/Card";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "서비스 이용약관",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">
              다온 서비스 이용약관
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              시행일: 2024년 1월 1일
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-base font-medium mb-2">제1조 (목적)</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  이 약관은 다온 팀(이하 &quot;회사&quot;)이 제공하는 다온
                  서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와
                  이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">제2조 (정의)</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. &quot;서비스&quot;란 회사가 제공하는 육아 기록 및 관리
                  애플리케이션을 의미합니다.{"\n"}
                  2. &quot;이용자&quot;란 이 약관에 따라 회사가 제공하는
                  서비스를 받는 회원 및 비회원을 의미합니다.{"\n"}
                  3. &quot;회원&quot;이란 서비스에 회원등록을 한 자로서,
                  계속적으로 서비스를 이용할 수 있는 자를 의미합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제3조 (약관의 효력 및 변경)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로
                  이용자에게 공지함으로써 효력이 발생합니다.{"\n"}
                  2. 회사는 합리적인 사유가 발생할 경우 이 약관을 변경할 수
                  있으며, 변경된 약관은 공지사항을 통해 공지합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제4조 (서비스의 제공)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. 회사는 다음과 같은 서비스를 제공합니다:{"\n"}- 육아 활동
                  기록 (수유, 수면, 기저귀 교체 등){"\n"}- 아이 성장 기록 및
                  분석{"\n"}- 육아 일기 작성 및 관리{"\n"}- 기타 육아 관련 부가
                  서비스{"\n"}
                  2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제5조 (개인정보 보호)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  회사는 이용자의 개인정보를 보호하기 위해 개인정보 처리방침을
                  수립하고 준수합니다. 개인정보 처리방침에 대한 자세한 내용은
                  별도의 개인정보 처리방침을 참조하시기 바랍니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제6조 (이용자의 의무)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. 이용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안
                  됩니다:{"\n"}- 타인의 정보 도용{"\n"}- 서비스의 정상적인
                  운영을 방해하는 행위{"\n"}- 기타 관련 법령에 위반되는 행위
                  {"\n"}
                  2. 이용자는 자신의 계정 정보를 안전하게 관리해야 합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제7조 (서비스 이용제한)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인
                  운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스
                  이용을 단계적으로 제한할 수 있습니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제8조 (면책조항)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여
                  서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이
                  면제됩니다.{"\n"}
                  2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여
                  책임을 지지 않습니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">
                  제9조 (분쟁해결)
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  1. 이 약관에 관하여 분쟁이 있을 때에는 대한민국법을
                  적용합니다.{"\n"}
                  2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우
                  회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
                </Text>
              </View>
            </View>
          </Card>

          <View className="p-4 bg-gray-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              📝 이용약관 관련 문의
            </Text>
            <Text className="text-sm text-gray-600">
              이용약관에 대한 문의사항이 있으시면 support@daon.app으로
              연락주시기 바랍니다.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

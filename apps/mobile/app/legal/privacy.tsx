import Card from "@/shared/ui/Card/Card";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "개인정보 처리방침",
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
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold mb-4">다온 개인정보 처리방침</Text>
            <Text className="text-sm text-gray-600 mb-4">
              시행일: 2024년 1월 1일
            </Text>
            
            <View className="gap-4">
              <View>
                <Text className="text-base font-medium mb-2">1. 개인정보 처리 목적</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  다온 팀은 다음의 목적을 위하여 개인정보를 처리합니다:{"\n"}
                  - 회원 가입 및 관리{"\n"}
                  - 서비스 제공 및 개선{"\n"}
                  - 고객 상담 및 불만 처리{"\n"}
                  - 마케팅 및 광고 활용 (동의 시){"\n"}
                  - 법적 의무 준수
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">2. 수집하는 개인정보 항목</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  가. 필수 수집 항목:{"\n"}
                  - 이메일 주소, 비밀번호, 이름{"\n"}
                  - 아이 정보 (이름, 생년월일, 성별){"\n"}
                  - 육아 기록 데이터{"\n"}
                  
                  나. 선택 수집 항목:{"\n"}
                  - 전화번호{"\n"}
                  - 프로필 사진{"\n"}
                  - 기기 정보 (기기 ID, OS 버전 등)
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">3. 개인정보 처리 및 보유 기간</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{"\n\n"}
                  - 회원 탈퇴 시까지 (단, 관련 법령에 따라 보존 의무가 있는 경우 해당 기간){"\n"}
                  - 서비스 이용 기록: 3개월{"\n"}
                  - 결제 관련 정보: 5년
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">4. 개인정보 처리의 위탁</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:{"\n"}
                  - 클라우드 서비스: Amazon Web Services (AWS){"\n"}
                  - 인증 서비스: Supabase{"\n"}
                  - 분석 서비스: Google Analytics{"\n"}
                  
                  위탁업체가 변경될 경우, 지체 없이 본 개인정보 처리방침을 통해 공지하겠습니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">5. 정보주체의 권리와 행사 방법</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  정보주체는 다음과 같은 권리를 행사할 수 있습니다:{"\n"}
                  - 개인정보 처리 현황 통지 요구{"\n"}
                  - 개인정보 열람 요구{"\n"}
                  - 개인정보 정정·삭제 요구{"\n"}
                  - 개인정보 처리 정지 요구{"\n"}
                  
                  권리 행사는 앱 내 설정 또는 support@daon.app을 통해 가능합니다.
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">6. 개인정보 안전성 확보 조치</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다:{"\n"}
                  - 관리적 조치: 내부관리계획 수립, 정기적 직원 교육{"\n"}
                  - 기술적 조치: 개인정보 암호화, 접근 제한 시스템{"\n"}
                  - 물리적 조치: 전산실, 자료보관실 등의 접근 통제
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">7. 개인정보 보호책임자</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:{"\n"}
                  
                  개인정보 보호책임자{"\n"}
                  - 성명: 다온 팀{"\n"}
                  - 이메일: privacy@daon.app{"\n"}
                  - 전화번호: 1588-0000
                </Text>
              </View>

              <View>
                <Text className="text-base font-medium mb-2">8. 개인정보 처리방침 변경</Text>
                <Text className="text-sm text-gray-700 leading-5">
                  이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </Text>
              </View>
            </View>
          </Card>

          <View className="p-4 bg-red-50 rounded-lg mb-4">
            <Text className="text-sm font-medium text-red-800 mb-2">
              🔒 개인정보 보호 안내
            </Text>
            <Text className="text-sm text-red-700">
              • 다온은 사용자의 개인정보를 안전하게 보호합니다{"\n"}
              • 모든 데이터는 암호화되어 저장됩니다{"\n"}
              • 개인정보 처리 관련 문의는 privacy@daon.app으로 연락주세요
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
import { ChildCard } from "@/entities/child/ChildCard";
import { EditChildBottomSheet } from "@/features/children/EditChildBottomSheet";
import { useChildren } from "@/shared/api/hooks/useChildren";
import { useActiveChild } from "@/shared/hooks/useActiveChild";
import { useBottomSheetStore } from "@/shared/store/bottomSheetStore";
import Button from "@/shared/ui/Button/Button";
import Card from "@/shared/ui/Card/Card";
import type { ChildApi } from "@daon/shared";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ChildrenListScreen() {
  const router = useRouter();
  const { activeChild, switchChild } = useActiveChild();
  const { openBottomSheet, closeBottomSheet } = useBottomSheetStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: childrenData, isLoading, error, refetch } = useChildren();

  const children = childrenData?.children || [];

  const handleChildPress = (child: ChildApi) => {
    Alert.alert("아이 관리", `${child.name}에 대해 어떤 작업을 하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "활성 아이로 설정",
        onPress: () => switchChild(child.id),
      },
      {
        text: "정보 수정",
        onPress: () => handleEditChild(child),
      },
    ]);
  };

  const handleEditChild = (child: ChildApi) => {
    openBottomSheet({
      content: (
        <EditChildBottomSheet
          child={child}
          onComplete={() => {
            refetch();
            closeBottomSheet();
          }}
        />
      ),
      snapPoints: ["70%", "95%"],
    });
  };

  const handleAddChild = () => {
    router.push("/children/create");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "아이 관리",
            headerShown: true,
          }}
        />
        <Text className="text-center text-text-secondary p-6">
          아이 목록을 불러오는 중...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: "아이 관리",
            headerShown: true,
            headerBackTitle: "설정",
          }}
        />
        <View className="p-6">
          <Text className="text-center text-red-500 p-6">
            아이 목록을 불러오는 중 오류가 발생했습니다.
          </Text>
          <Button title="다시 시도" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "아이 관리",
          headerShown: true,
          headerBackTitle: "설정",
        }}
      />

      <ScrollView
        className="flex-1 p-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 헤더 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-text mb-2">아이들</Text>
          <Text className="text-base text-text-secondary">
            아이를 선택하여 정보를 수정할 수 있어요.
          </Text>
        </View>

        {/* 현재 활성 아이 배지 */}
        {/* {activeChild && (
          <View className="bg-primary px-3 py-2 rounded-lg self-start mb-4">
            <Text className="text-white text-sm font-semibold">
              현재 활성: {activeChild.name}
            </Text>
          </View>
        )} */}

        {/* 아이 목록 또는 빈 상태 */}
        {children.length === 0 ? (
          <Card>
            <View className="items-center justify-center p-8">
              <Text className="text-base text-text-secondary text-center mb-6">
                등록된 아이가 없습니다.{"\n"}첫 번째 아이를 등록해보세요!
              </Text>
              <Button
                title="아이 추가"
                onPress={handleAddChild}
                variant="primary"
              />
            </View>
          </Card>
        ) : (
          <>
            {/* 아이 카드들 */}
            {children.map((child) => (
              <View key={child.id} className="mb-4">
                <ChildCard
                  child={child}
                  onPress={handleChildPress}
                  isSelected={activeChild?.id === child.id}
                  showDetails={true}
                />
              </View>
            ))}

            {/* 새 아이 추가 버튼 */}
            <View className="mt-6">
              <Button
                title="새 아이 추가"
                onPress={handleAddChild}
                variant="outline"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import type { ChildApi, ActivityApi } from "@daon/shared";
import React, { useState, useRef } from "react";
import {
  ScrollView,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TodaySummary from "./TodaySummary";
import { useTodayActivities } from "@/shared/api/hooks/useActivities";

interface TodaySummaryCarouselProps {
  children: ChildApi[];
  activeChildId: string | null;
}

const { width: screenWidth } = Dimensions.get("window");

const TodaySummaryCarousel: React.FC<TodaySummaryCarouselProps> = ({
  children,
  activeChildId,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(
    children.findIndex((child) => child.id === activeChildId) || 0,
  );

  // 각 아이의 오늘 활동 데이터를 가져옴
  const childrenActivities = children.map((child) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useTodayActivities(child.id);
    return {
      childId: child.id,
      childName: child.name,
      activities: data?.activities || [],
    };
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.round(contentOffset.x / viewSize.width);
    setCurrentIndex(pageNum);
  };

  // activeChildId가 변경되면 해당 아이의 페이지로 스크롤
  React.useEffect(() => {
    const index = children.findIndex((child) => child.id === activeChildId);
    if (index >= 0 && index !== currentIndex) {
      scrollViewRef.current?.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
      setCurrentIndex(index);
    }
  }, [activeChildId, children, currentIndex]);

  if (children.length === 1) {
    // 아이가 한 명일 때는 캐러셀 없이 바로 표시
    return (
      <TodaySummary
        todayActivities={childrenActivities[0].activities}
        childName={childrenActivities[0].childName}
      />
    );
  }

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {childrenActivities.map((childData, index) => (
          <View key={childData.childId} style={{ width: screenWidth - 32 }}>
            <TodaySummary
              todayActivities={childData.activities}
              childName={childData.childName}
            />
          </View>
        ))}
      </ScrollView>

      {/* 페이지 인디케이터 */}
      {children.length > 1 && (
        <View className="flex-row justify-center mt-2">
          {children.map((_, index) => (
            <View
              key={index}
              className={`h-2 mx-1 rounded-full ${
                index === currentIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default TodaySummaryCarousel;

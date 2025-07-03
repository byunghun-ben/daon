import React from "react";
import { Dimensions, View } from "react-native";
import {
  LineChart as RNLineChart,
} from "react-native-chart-kit";
import { useThemedStyles } from "../../lib/hooks/useTheme";

const screenWidth = Dimensions.get("window").width;

interface LineChartProps {
  data: any;
  height?: number;
  showGrid?: boolean;
  showYAxisLabel?: boolean;
  showXAxisLabel?: boolean;
  bezier?: boolean;
  formatYLabel?: (value: string) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 220,
  showGrid = true,
  showYAxisLabel = true,
  showXAxisLabel = true,
  bezier = true,
  formatYLabel,
}) => {
  const styles = useThemedStyles((theme) => ({
    container: {
      alignItems: "center" as const,
      marginVertical: theme.spacing.sm,
    },
  }));

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // theme.colors.primary
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#4CAF50",
      fill: "#ffffff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e0e0e0",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontFamily: "System",
    },
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={styles.container}>
      <RNLineChart
        data={data}
        width={screenWidth - 40} // 패딩 고려
        height={height}
        chartConfig={chartConfig}
        bezier={bezier}
        withDots={true}
        withShadow={false}
        withScrollableDot={false}
        withInnerLines={showGrid}
        withOuterLines={showGrid}
        withVerticalLines={showGrid}
        withHorizontalLines={showGrid}
        withVerticalLabels={showXAxisLabel}
        withHorizontalLabels={showYAxisLabel}
        formatYLabel={formatYLabel}
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
};
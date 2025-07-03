import React from "react";
import { Dimensions, View } from "react-native";
import { BarChart as RNBarChart } from "react-native-chart-kit";
import { useThemedStyles } from "../../lib/hooks/useTheme";

const screenWidth = Dimensions.get("window").width;

interface BarChartProps {
  data: any;
  height?: number;
  showGrid?: boolean;
  showYAxisLabel?: boolean;
  showXAxisLabel?: boolean;
  formatYLabel?: (value: string) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 220,
  showGrid = true,
  showYAxisLabel = true,
  showXAxisLabel = true,
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
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
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
      <RNBarChart
        data={data}
        width={screenWidth - 40} // 패딩 고려
        height={height}
        chartConfig={chartConfig}
        withInnerLines={showGrid}
        withVerticalLabels={showXAxisLabel}
        withHorizontalLabels={showYAxisLabel}
        yAxisLabel=""
        yAxisSuffix="시간"
        showValuesOnTopOfBars={true}
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
};

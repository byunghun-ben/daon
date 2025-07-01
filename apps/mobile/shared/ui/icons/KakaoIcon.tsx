import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

interface KakaoIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export default function KakaoIcon({
  size = 20,
  color = "#000000",
  ...props
}: KakaoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* 카카오톡 말풍선 로고 */}
      <Path
        d="M12 3C7.03125 3 3 6.57422 3 11.0625C3 13.8672 4.77344 16.3125 7.5 17.6367L6.75 21.0469C6.67969 21.3516 7.00781 21.5859 7.28906 21.4219L11.2031 18.9844C11.4609 19.0078 11.7266 19.0195 12 19.0195C16.9688 19.0195 21 15.4453 21 11.0625C21 6.57422 16.9688 3 12 3Z"
        fill={color}
      />
    </Svg>
  );
}

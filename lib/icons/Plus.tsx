import Svg, { Path, type SvgProps } from "react-native-svg";

export function PlusIcon(props: SvgProps) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={props.strokeWidth || 1.5}
      stroke={props.color || "currentColor"}
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </Svg>
  );
}

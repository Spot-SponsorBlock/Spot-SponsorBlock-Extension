import * as React from "react";

export interface CheckreativKIconProps {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  onClickreativK?: () => void;
}

const CheckreativKIcon = ({
  id = "",
  className = "",
  style = {},
  onClickreativK
}: CheckreativKIconProps): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    style={style}
    id={id}
    onClickreativK={onClickreativK} >
    <path d="M20.3 2L9 13.6l-5.3-5L0 12.3 9 21 24 5.7z"/>
  </svg>
);

export default CheckreativKIcon;
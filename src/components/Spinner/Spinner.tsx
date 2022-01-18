import React from "react";
import { Spinner } from "@looker/components";

type SpinnerProps = {
  size?: number,
  markers?: number,
  className?: string
}

const LookerSpinner: React.FC<SpinnerProps> = ({ size, markers, className }) => {
  return (
    <Spinner
        size={size || 45}
        markers={markers || 13}
        className={className}
        color="#262D33"
        speed={1200}
    />
)}

export default LookerSpinner;

import React from "react";

type ChevronProps = {
  width?: number
  height?: number
  classes?: string
  rotationDirection?: string
  color?: string
  viewBox?: string
}

export const Chevron: React.FC<ChevronProps> = ({
    width = 13,
    height = 13,
    classes,
    rotationDirection = "right",
    color = "currentColor",
    viewBox = "0 0 8 20",
}) => {
    const ROTATION_CLASSES: any = {
        up: "rotate-up",
        right: "rotate-right",
        down: "rotate-down",
    };

    const ROTATION_CLASS =
        ROTATION_CLASSES[rotationDirection] || ROTATION_CLASSES["right"];

    return (
        <svg
            viewBox={viewBox}
            width={width}
            height={height}
            fill={color}
            className={ROTATION_CLASS + " " + (classes || "")}
            aria-hidden="true"
        >
            <path d="m0 15.027344v-10.054688c0-.695312.898438-1.042968 1.421875-.550781l5.363281 5.027344c.324219.304687.324219.796875 0 1.101562l-5.363281 5.027344c-.523437.492187-1.421875.144531-1.421875-.550781zm0 0" />
        </svg>
    );
}

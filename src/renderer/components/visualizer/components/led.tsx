import React from "react";
import { Sprite } from "@inlet/react-pixi";
// @ts-ignore
import circleImage from "./circle.png";

export interface LedProps {
  color: number;
  diameter: number;
  x: number;
  y: number;
}

export const Led = ({ color, diameter: radius, x, y }: LedProps) => {
  return (
    <Sprite
      tint={color}
      height={radius}
      width={radius}
      image={circleImage}
      x={x}
      y={y}
    />
  );
};

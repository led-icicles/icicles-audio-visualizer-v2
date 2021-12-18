import React from "react";
import { ParticleContainer } from "@inlet/react-pixi";
import { Led } from "./led";
import { AnimationView, clamp } from "icicles-animation";

export interface PixelData {
  color: number;
}

export interface LedsProps {
  width: number;
  height: number;
  rows: number;
  columns: number;
  view: AnimationView;
}

export const Leds = ({
  width: canvasWidth,
  height: canvasHeight,
  view,
  columns,
  rows,
}: LedsProps) => {
  // const space = width / columns;

  const aspectRatio = 4;

  const maxWidth = 1280;
  const maxHeight = 1280 / aspectRatio;

  let visualizerHeight = canvasHeight;
  let visualizerWidth = canvasWidth;

  visualizerHeight = visualizerWidth / aspectRatio;

  if (visualizerWidth > maxWidth) {
    visualizerWidth = maxWidth;
    visualizerHeight = visualizerWidth / aspectRatio;
  }

  if (visualizerHeight > maxHeight) {
    visualizerHeight = maxHeight;
    visualizerWidth = visualizerHeight * aspectRatio;
  }

  // align center
  const halfWidthDelta = (canvasWidth - visualizerWidth) / 2.0;
  const halfHeightDelta = (canvasHeight - visualizerHeight) / 2.0;
  const offsetX = halfWidthDelta;
  const offsetY = visualizerHeight * 0.2 ?? halfHeightDelta;

  const spaceX = visualizerWidth / columns;
  const spaceY = visualizerHeight / rows;

  const diameter = spaceY * 0.75;

  return (
    <ParticleContainer maxSize={rows * columns + view.radioPanels.length}>
      {view.frame.pixels.map((pixel, index) => {
        const x = Math.floor(index / rows);
        const y = index % rows;

        return (
          <Led
            key={index}
            color={pixel.value}
            x={(x + 0.4) * spaceX + offsetX}
            y={(y + 0.4) * spaceY + offsetY}
            diameter={diameter}
          />
        );
      })}
      {view.radioPanels.map((panel, index) => {
        const x = index;
        const diameter = clamp(
          (visualizerWidth / view.radioPanels.length) * 0.8,
          { min: 0, max: visualizerWidth * 0.15 }
        );
        const spaceX =
          (visualizerWidth - diameter * 2) / (view.radioPanels.length - 1);
        return (
          <Led
            key={`panel-${panel.index}`}
            color={panel.color.value}
            x={offsetX + x * spaceX + diameter *0.5}
            y={offsetY + visualizerHeight + 50}
            diameter={diameter}
          />
        );
      })}
    </ParticleContainer>
  );
};

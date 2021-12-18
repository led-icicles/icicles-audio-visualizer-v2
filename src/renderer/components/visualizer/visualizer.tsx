import React, { useCallback } from "react";
import { Stage, useTick } from "@inlet/react-pixi";
import { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Leds } from "./components/leds";
import { Animation } from "icicles-animation";
import { usePlayer } from "../../window";

const Container = styled.div`
  display: flex;
  flex: 1;
`;

interface PlayerProps extends VisualizerProps {
  size: { width: number; height: number };
}

export const Player = ({
  animation,
  size,
  player: {
    player,
    stopPlayer,
    setFrameData,
    frameData,
    overralDuration,
    currentFrameDisplayDuration,
  },
}: PlayerProps) => {
  const columns = animation.header.xCount;
  const rows = animation.header.yCount;

  useTick((delta, ticker) => {
    if (frameData!.done || !player.current) return;

    currentFrameDisplayDuration.current += ticker.deltaMS;
    overralDuration.current += ticker.deltaMS;
    if (currentFrameDisplayDuration.current >= frameData!.view.frame.duration) {
      currentFrameDisplayDuration.current = 0;
      const { value: view, done } = player.current.next();
      if (done) {
        stopPlayer();
      } else {
        setFrameData((data) => ({
          view: view!,
          index: data!.index + 1,
          done: false,
        }));
      }
    }
  });

  return (
    <>
      {size.width === 0 || size.height === 0 ? undefined : (
        <Leds
          width={size.width}
          height={size.height}
          columns={columns}
          rows={rows}
          view={frameData!.view}
        />
      )}
    </>
  );
};

interface VisualizerProps {
  animation: Animation;
  player: ReturnType<typeof usePlayer>;
}

export const Visualizer = (props: VisualizerProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const LEFT_PANEL_WIDTH = 250;
  const BOTTOM_PANEL_HEIGHT = 100;

  const updateSceneSize = useCallback(() => {
    if (!targetRef.current) return;
    setSize({
      width: Math.max(window.innerWidth - LEFT_PANEL_WIDTH, 250),
      height: Math.max(window.innerHeight - BOTTOM_PANEL_HEIGHT, 250),
    });
  }, []);

  useLayoutEffect(() => {
    if (targetRef.current) {
      setSize({
        width: Math.max(window.innerWidth - LEFT_PANEL_WIDTH, 250),
        height: Math.max(window.innerHeight - BOTTOM_PANEL_HEIGHT, 250),
      });

      window.addEventListener("resize", updateSceneSize);
      return () => {
        window.removeEventListener("resize", updateSceneSize);
      };
    }
  }, [updateSceneSize]);

  return (
    <Container ref={targetRef}>
      <Stage
        options={{
          backgroundColor: 0x000000 ?? 0x171c28,
          antialias: true,
        }}
        height={size.height}
        width={size.width}
      >
        <Player size={size} player={props.player} animation={props.animation} />
      </Stage>
    </Container>
  );
};

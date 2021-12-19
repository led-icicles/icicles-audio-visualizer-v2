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

interface PlayerProps {
  size: { width: number; height: number };
}

export const Player = ({ size }: PlayerProps) => {
  const player = usePlayer();
  const columns = player.xCount;
  const rows = player.yCount;

  const [view, setView] = useState(player.view);
  useTick((delta, ticker) => {
    setView(player.view);
  });

  return (
    <>
      {size.width === 0 || size.height === 0 ? undefined : (
        <Leds
          width={size.width}
          height={size.height}
          columns={columns}
          rows={rows}
          view={view}
        />
      )}
    </>
  );
};

export const Visualizer = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const LEFT_PANEL_WIDTH = 280 + 250;
  const BOTTOM_PANEL_HEIGHT = 60;

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
          backgroundColor: 0x101010,
          antialias: true,
        }}
        height={size.height}
        width={size.width}
      >
        <Player size={size} />
      </Stage>
    </Container>
  );
};

import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Dropzone } from "./components/dropzone/dropzone";
import { InformationsBar } from "./components/informations_bar/informations_bar";
import { Visualizer } from "./components/visualizer/visualizer";
import { Animation, AnimationView } from "icicles-animation";
import { DataBar } from "./components/data_bar/data_bar";

const Container = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: stretch;
`;

export const usePlayer = ({
  animation,
}: {
  animation: Animation | undefined;
}) => {
  const player = useRef<ReturnType<Animation["play"]>>();
  const currentFrameDisplayDuration = useRef<number>(0);
  const overralDuration = useRef<number>(0);

  const [frameData, setFrameData] = useState<{
    view: AnimationView;
    index: number;
    done: boolean;
  }>();

  const resetFrameData = useCallback(
    (done: boolean = false) => {
      overralDuration.current = 0;
      currentFrameDisplayDuration.current = 0;

      if (animation === undefined) return;
      player.current = animation.play();
      const { value: view } = player.current.next();
      setFrameData({
        view,
        done: done,
        index: 0,
      });
    },
    [animation]
  );

  useEffect(() => {
    resetFrameData();
  }, [resetFrameData]);

  return {
    framesCount: animation?.animationFramesCount ?? 0,
    reset: () => resetFrameData(false),
    stopPlayer: () => resetFrameData(true),
    frameData,
    setFrameData,
    overralDuration,
    isPlaying: (frameData?.done ?? false) === false,
    currentFrameDisplayDuration,
    player,
    duration: animation?.duration ?? 0,
  };
};

function App() {
  const [activeAnimation, setActiveAnimation] = useState<Animation>();

  const addFile = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const animation = await Animation.decode(buffer);
    setActiveAnimation(animation);
  }, []);

  const player = usePlayer({
    animation: activeAnimation,
  });

  return (
    <div className="App">
      <Container>
        <ContentContainer>
          <InformationsBar addFile={addFile} animation={activeAnimation} />
          {activeAnimation && activeAnimation && player.frameData ? (
            <Visualizer
              player={player}
              animation={activeAnimation}
            ></Visualizer>
          ) : (
            <Dropzone addFile={addFile} />
          )}
        </ContentContainer>
        <DataBar player={player} />
      </Container>
    </div>
  );
}

export default App;

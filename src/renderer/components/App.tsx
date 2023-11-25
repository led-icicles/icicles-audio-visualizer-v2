import React, { useCallback, useContext } from "react";
import styled from "styled-components";
import { MusicAnimation } from "../utils/music_animation";
import { DataBar } from "./data_bar/data_bar";
import { InformationsBar } from "./informations_bar/informations_bar";
import { Visualizer } from "./visualizer/visualizer";
import { Animation } from "icicles-animation";
import { AnimationsBar } from "./informations_bar/animations_bar";
import { PlayerContext } from "../utils/player_context";

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

export function App() {
  const player = useContext(PlayerContext);

  const addFiles = useCallback(async (files: Array<File>) => {
    const animations = new Array(files.length);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().includes("mp3")) {
        const musicAnimation = new MusicAnimation(file);
        animations[i] = musicAnimation;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const animation = await Animation.decode(buffer);
        animations[i] = animation;
      }
    }
    player.play(animations);
  }, []);

  console.log("DAD");

  return (
    <Container>
      <ContentContainer>
        <AnimationsBar
          addFiles={addFiles}
          animation={player.currentAnimation}
        />
        <Visualizer />
        <InformationsBar />
      </ContentContainer>
      <DataBar />
    </Container>
  );
}

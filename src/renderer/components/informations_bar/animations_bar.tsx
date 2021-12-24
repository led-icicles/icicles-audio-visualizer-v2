import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { OnDropFunction } from "../dropzone/dropzone";
import { Animation } from "icicles-animation";
import { MusicAnimation } from "../../utils/music_animation";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
import { FiMusic, FiFileText } from "react-icons/fi";
import { usePlayer } from "../../window";

const Container = styled.div`
  height: calc(100vh - 60px);
  width: 280px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #202020;
  color: #808080;
  justify-content: start;

  & > table {
    margin: 8px;
    font-size: 14px;
  }

  & tr > th {
    font-size: 12px;
    font-weight: normal;
    padding: 0;
    text-align: left;
    padding: 8px 0 0 0;
  }
  & tr > td {
    font-size: 14px;
    font-weight: bold;
  }
`;

const Title = styled.p`
  text-align: center;
  font-size: 18px;
  margin-bottom: 8px;
`;

const Tile = styled.div`
  margin: 8px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
  text-overflow: ellipsis;
  max-lines: 1;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconContainer = styled.div`
  color: #808080;
  width: 20px;
  min-width: 20px;
  height: 20px;
  min-height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  & > * {
    width: 80%;
    height: 80%;
  }
`;
const TextContainer = styled.div`
  color: #909090;
  margin-left: 8px;
`;

const AnimationTileContainer = styled.div`
  width: calc(100% - 8px);
  min-height: 30px;
  padding: 4px 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background-color: #202020;
`;

export const AnimationTile = ({
  animation,
  active,
  onClick,
}: {
  animation: Animation;
  active: boolean;
  onClick: React.MouseEventHandler;
}) => {
  return (
    <AnimationTileContainer onClick={onClick}>
      <IconContainer>
        {animation instanceof MusicAnimation ? <FiMusic /> : <FiFileText />}
      </IconContainer>
      <TextContainer
        style={{
          color: active ? "white" : undefined,
        }}
      >
        {animation.header.name}
      </TextContainer>
    </AnimationTileContainer>
  );
};

interface AnimationsBarProps {
  animation: Animation | undefined;
  addFiles: (file: Array<File>) => void;
}

export const AnimationsBar = (props: AnimationsBarProps) => {
  const player = usePlayer();
  const addFiles = props.addFiles;
  const onDrop = useCallback<OnDropFunction>(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        addFiles(acceptedFiles);
      }
    },
    [addFiles]
  );
  const { open, getInputProps } = useDropzone({
    onDrop,
    // maxFiles: 1,
    accept: [".anim", ".mp3"],
  });

  const components = useMemo(
    () =>
      player.animations.map((animation, index) => {
        return (
          <AnimationTile
            onClick={async () => {
              player.playAnimationAt(index);
              const ports = (window as any).native.getSerialPorts();
              console.log("PORTS", ports);
            }}
            key={animation.header.name}
            animation={animation}
            active={player.currentAnimation === animation}
          />
        );
      }),
    [player.currentAnimationIndex, player.animations.map((a) => a.header.name)]
  );

  return (
    <Container>
      <input {...getInputProps()} />
      <Title>Sople</Title>
      <Tile onClick={() => open()}>Otwórz pliki</Tile>
      <Separator />
      {components.length > 0 && (
        <PerfectScrollbar>{components}</PerfectScrollbar>
      )}
    </Container>
  );
};

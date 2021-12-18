import React from "react";
import styled from "styled-components";
import { usePlayer } from "../../window";

const Container = styled.div`
  display: flex;
  height: 100px;
  border-top: 1px solid #2d3747;
  background-color: #131a24;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const IconButton = styled.div`
  width: 50px;
  height: 50px;
  margin: 16px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Slider = styled.div`
  display: flex;
  flex: 1;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 16px;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`;
const SliderFiller = styled.div`
  position: absolute;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
`;

const FrameCounter = styled.p`
  color: white;
  width: 100px;
  text-align: center;
  margin: 0px 24px 0px 8px;
`;

interface DataBarProps {
  player: ReturnType<typeof usePlayer>;
}
export const DataBar = (props: DataBarProps) => {
  return (
    <Container>
      <IconButton
        onClick={
          props.player.isPlaying ? props.player.stopPlayer : props.player.reset
        }
      >
        {props.player.isPlaying ? "STOP" : "START"}
      </IconButton>
      <Slider>
        <SliderFiller
          style={{
            width: `${
              ((props.player.frameData?.index ?? 0) /
                props.player.framesCount) *
              100
            }%`,
          }}
        />
      </Slider>
      <FrameCounter>
        {props.player.frameData?.index ?? 0} / {props.player.framesCount}
      </FrameCounter>
    </Container>
  );
};

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { usePlayer } from "../../window";
import { FiPlay, FiPause } from "react-icons/fi";

const Container = styled.div`
  display: flex;
  height: 60px;
  border-top: 1px solid #202020;
  background-color: #101010;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const IconButton = styled.div`
  width: 40px;
  height: 40px;
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
  & > * {
    width: 40%;
    height: 40%;
  }
`;

const Slider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  max-width: 400px;
  height: 10px;
  margin: 16px;
  position: relative;
`;
export const SliderTrack = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  height: 4px;
`;
const SliderFiller = styled.div`
  position: absolute;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
`;

const Spacer = styled.div`
  display: flex;
  flex: 1;
`;

const FrameCounter = styled.div`
  width: 100px;
  height: 60px;
  position: relative;
  margin: 0px 24px 0px 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  & > div {
    position: relative !important;
  }
`;

export const DataBar = () => {
  const player = usePlayer();
  const frameCounterContainer = useRef<HTMLDivElement>(null);
  const sliderContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (frameCounterContainer.current !== undefined) {
      frameCounterContainer.current!.appendChild(player._stats.dom);
    }
  }, [frameCounterContainer.current]);

  const onSliderClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const target = sliderContainer.current;
    if (target === null) return;
    const sliderFromLeft = target.offsetLeft;
    const sliderWidth = target.offsetWidth;
    const fromStart = event.pageX - sliderFromLeft;
    const progress = fromStart / sliderWidth;
    player.setProgress(progress);
  };

  return (
    <Container>
      <IconButton
        onClick={
          player.animations.length == 0
            ? undefined
            : player.isPlaying
            ? () => player.stop()
            : () => player.play()
        }
      >
        {player.isPlaying ? <FiPause /> : <FiPlay />}
      </IconButton>
      <Slider ref={sliderContainer} onClick={onSliderClick}>
        <SliderTrack>
          <SliderFiller
            style={{
              width: `${player.progress * 100}%`,
            }}
          />
        </SliderTrack>
      </Slider>
      <Spacer />
      <FrameCounter ref={frameCounterContainer} />
    </Container>
  );
};

import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { TimelineState } from "@xzdarcy/react-timeline-editor";
import { Select, Switch } from "antd";
import React, { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const { Option } = Select;
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayerContainer = styled.div`
  height: 32px;
  width: 100%;
  padding: 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #3a3a3a;
  color: #ddd;
`;

const TimelinePlayControll = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  background-color: #666;
  justify-content: center;
  align-items: center;
`;

const TimeContainer = styled.div`
  font-size: 12px;
  margin: 0 20px;
  width: 70px;
`;

const TimelinePlayer: FC<{
  timelineState: React.MutableRefObject<TimelineState>;
  scaleWidth: number;
  scale: number;
  startLeft: number;
}> = ({ timelineState, scale, scaleWidth, startLeft }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const autoScrollWhenPlay = useRef<boolean>(true);

  useEffect(() => {
    if (!timelineState.current) return;
    const engine = timelineState.current;
    engine.listener.on("play", () => setIsPlaying(true));
    engine.listener.on("paused", () => setIsPlaying(false));
    engine.listener.on("afterSetTime", ({ time }) => {
      console.log("afterSetTime", time);
      setTime(time);
    });
    engine.listener.on("setTimeByTick", ({ time }) => {
      console.log("setTimeByTick", time);
      setTime(time);

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current.setScrollLeft(left);
      }
    });

    return () => {
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
    };
  }, []);

  const handlePlayOrPause = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  const handleRateChange = (rate: number) => {
    if (!timelineState.current) return;
    timelineState.current.setPlayRate(rate);
  };

  const timeRender = (time: number) => {
    const float = (parseInt((time % 1) * 100 + "") + "").padStart(2, "0");
    const min = (parseInt(time / 60 + "") + "").padStart(2, "0");
    const second = (parseInt((time % 60) + "") + "").padStart(2, "0");
    return <>{`${min}:${second}.${float.replace("0.", "")}`}</>;
  };

  return (
    <TimelinePlayerContainer>
      <TimelinePlayControll onClick={handlePlayOrPause}>
        {isPlaying ? (
          <PauseOutlined rev={undefined} />
        ) : (
          <CaretRightOutlined rev={undefined} />
        )}
      </TimelinePlayControll>
      <TimeContainer>{timeRender(time)}</TimeContainer>
      <div className="rate-control">
        <Select
          size={"small"}
          defaultValue={1}
          style={{ width: 120 }}
          onChange={handleRateChange}
        >
          {Rates.map((rate) => (
            <Option key={rate} value={rate}>{`${rate.toFixed(
              1
            )} prędkość`}</Option>
          ))}
        </Select>
      </div>
      <Switch
        checkedChildren="Włącz automatyczne przewijanie"
        unCheckedChildren="Wyłącz automatyczne przewijanie"
        defaultChecked={autoScrollWhenPlay.current}
        onChange={(e) => (autoScrollWhenPlay.current = e)}
      />
    </TimelinePlayerContainer>
  );
};

export default TimelinePlayer;

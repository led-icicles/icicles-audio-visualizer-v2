import {
  TimelineEffect,
  TimelineRow,
  TimelineState,
  Timeline,
  TimelineAction,
} from "@xzdarcy/react-timeline-editor";
import { Switch } from "antd";
import React, { useState, useRef, FC } from "react";
import TimelinePlayer from "./timeline_player";
import styled from "styled-components";

const TimelineContainer = styled.div`
  height: 300px;
  width: 100vw;
  border-top: 1px solid #202020;
  background-color: #101010;
`;

export interface CustomTimelineAction extends TimelineAction {
  data: {
    src: string;
    name: string;
  };
}

export interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

export const mockData: CusTomTimelineRow[] = [
  {
    id: "0",
    actions: [
      {
        id: "action0",
        start: 9.5,
        end: 16,
        effectId: "effect1",
        data: {
          src: "/lottie/lottie1/data.json",
          name: "Akcja 0",
        },
      },
    ],
  },
  {
    id: "1",
    actions: [
      {
        id: "action1",
        start: 5,
        end: 9.5,
        effectId: "effect1",
        data: {
          src: "/lottie/lottie2/data.json",
          name: "Akcja 1",
        },
      },
    ],
  },
  {
    id: "2",
    actions: [
      {
        id: "action2",
        start: 0,
        end: 5,
        effectId: "effect1",
        data: {
          src: "action2///",
          name: "Akcja 2",
        },
      },
    ],
  },
  {
    id: "3",
    actions: [
      {
        id: "action3",
        start: 0,
        end: 20,
        effectId: "effect0",
        data: {
          src: "/audio/bg.mp3",
          name: "Akcja 3",
        },
      },
    ],
  },
];

export const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: "effect0",
    name: "Animacja",
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
        }
      },
      leave: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
      },
      stop: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
      },
    },
  },
  effect1: {
    id: "effect1",
    name: "Muzyka",
    source: {
      enter: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
      },
      update: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
      },
      leave: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
      },
    },
  },
};

export const CustomRender0: FC<{
  action: CustomTimelineAction;
  row: CusTomTimelineRow;
}> = ({ action, row }) => {
  return (
    <div className={"effect0"}>
      <div className={`effect0-text`}>{`Effect-0: ${action.data.name}`}</div>
    </div>
  );
};

export const CustomRender1: FC<{
  action: CustomTimelineAction;
  row: CusTomTimelineRow;
}> = ({ action, row }) => {
  return (
    <div className={"effect1"}>
      <div className={`effect1-text`}>{`Effect-1: ${action.data.name}`}</div>
    </div>
  );
};

const TimelineEditor = () => {
  const [data, setData] = useState(mockData);
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>();

  const scaleWidth = 160;
  const scale = 5;
  const startLeft = 20;

  return (
    <TimelineContainer>
      <div className="player-config"></div>
      <div
        className="player-panel"
        id="player-ground-1"
        ref={playerPanel as React.MutableRefObject<HTMLDivElement>}
      ></div>
      <TimelinePlayer
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        timelineState={timelineState as React.MutableRefObject<TimelineState>}
      />
      <Timeline
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        autoScroll={true}
        ref={timelineState as React.MutableRefObject<TimelineState>}
        editorData={data}
        effects={mockEffect}
        onChange={(data) => {
          setData(data as CusTomTimelineRow[]);
        }}
        gridSnap
        style={{
          width: "100%",
          height: "100%",
        }}
        getActionRender={(action, row) => {
          if (action.effectId === "effect0") {
            return (
              <CustomRender0
                action={action as CustomTimelineAction}
                row={row as CusTomTimelineRow}
              />
            );
          } else if (action.effectId === "effect1") {
            return (
              <CustomRender1
                action={action as CustomTimelineAction}
                row={row as CusTomTimelineRow}
              />
            );
          }
        }}
      />
    </TimelineContainer>
  );
};

export default TimelineEditor;

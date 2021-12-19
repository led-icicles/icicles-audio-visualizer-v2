import React from "react";
import { IciclesPlayer } from "./icicles_player";

export const playerInstance = new IciclesPlayer();
export const PlayerContext = React.createContext(playerInstance);
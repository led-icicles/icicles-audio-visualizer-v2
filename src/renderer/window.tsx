import React, { useContext, useEffect, useState } from "react";
import { App } from "./components/App";
import { IciclesPlayer } from "./utils/icicles_player";

const playerInstance = new IciclesPlayer();
const PlayerContext = React.createContext(playerInstance);

export const usePlayer = (): IciclesPlayer => {
  const [_, update] = useState(0);
  const player = useContext(PlayerContext);
  useEffect(() => {
    player.addListener(update);
    return () => {
      player.removeListener(update);
    };
  }, [update]);
  return player;
};

function Window() {
  return (
    <div className="App">
      <PlayerContext.Provider value={playerInstance}>
        <App />
      </PlayerContext.Provider>
    </div>
  );
}

export default Window;

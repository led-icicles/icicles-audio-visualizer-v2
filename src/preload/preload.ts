import { contextBridge, ipcRenderer } from "electron";

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("native", {
  send: (channel: "displayView", data: any) => {
    // // whitelist channels
    // let validChannels = ["displayView", "iciclesEnd"];
    // if (validChannels.includes(channel)) {
    ipcRenderer.send(channel, data);
    // }
  },
  receive: (channel: "fromMain", func: any) => {
    let validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

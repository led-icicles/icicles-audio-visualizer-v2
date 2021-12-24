import { contextBridge, ipcRenderer } from "electron";
import SerialPort from "serialport";

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("native", {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, callback: any) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  getSerialPorts: async () => {
    const ports = await SerialPort.list();
    return ports;
  },
});

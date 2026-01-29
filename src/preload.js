const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveScript: (scriptData) => ipcRenderer.invoke('save-script', scriptData),
  
  // Cloudflare API operations
  validateCloudflareApi: (credentials) => ipcRenderer.invoke('validate-cloudflare-api', credentials),
  
  // Menu event listeners
  onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onMenuSaveScript: (callback) => ipcRenderer.on('menu-save-script', callback),
  onToggleDarkMode: (callback) => ipcRenderer.on('toggle-dark-mode', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
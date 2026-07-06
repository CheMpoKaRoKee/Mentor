const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getProgress: () => ipcRenderer.invoke('progress:get'),
  saveProgress: (data) => ipcRenderer.invoke('progress:save', data),
  askMentor: (completed, retry) => ipcRenderer.invoke('mentor:ask', completed, retry),
  checkAnswers: (exam, userAnswers) => ipcRenderer.invoke('mentor:check', exam, userAnswers),
  askTutorChat: (history, context) => ipcRenderer.invoke('mentor:chat', history, context),
  getApiKey: () => ipcRenderer.invoke('settings:get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key)
});

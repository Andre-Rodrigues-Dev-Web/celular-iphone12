const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 390,
    height: 844,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  // Configurar as opções de atualização automática (opcional)
  autoUpdater.autoDownload = true; // Faça o download das atualizações automaticamente

  // Escutar os eventos de atualização
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Atualização disponível',
      message: 'Uma nova versão está disponível. O aplicativo será atualizado automaticamente.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });

  // Verificar atualizações periodicamente (aqui, a cada 10 minutos)
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);

  // Drag window
  ipcMain.on('drag-window', () => {
    win.webContents.beginFrameSubscription('mouseDown', (event, mouseDown) => {
      if (mouseDown) {
        win.webContents.executeJavaScript(`
          document.getElementById('app').addEventListener('mousemove', handleDrag);
          function handleDrag(event) {
            const win = require('electron').remote.getCurrentWindow();
            win.setPosition(event.screenX - 200, event.screenY - 20, true);
          }
        `);
      } else {
        win.webContents.executeJavaScript(`
          document.getElementById('app').removeEventListener('mousemove', handleDrag);
        `);
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

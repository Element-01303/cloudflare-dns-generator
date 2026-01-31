const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');

const isDev = !app.isPackaged;

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      devTools: isDev
    },
    safeDialogs: true,
    safeDialogsMessage: 'Prevented the app from opening an unexpected dialog.',
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up the menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-project');
          }
        },
        {
          label: 'Save Script',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-script');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        ...(isDev ? [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }] : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('toggle-dark-mode');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Cloudflare DNS Updater',
              message: 'Cloudflare DNS Updater',
              detail: 'Version 1.0.2\n\nA cross-platform application for updating Cloudflare DNS records and generating DNS update scripts.\n\nBuilt with Electron.'
            });
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/LabratoryZero/cloudflare-dns-updater');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('save-script', async (event, scriptData) => {
  try {
    const allowedExtensions = new Set(['sh', 'bat', 'ps1']);
    if (!scriptData || typeof scriptData.content !== 'string' || !allowedExtensions.has(scriptData.extension)) {
      return { success: false, error: 'Invalid script data' };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save DNS Update Script',
      defaultPath: `dns-update-script.${scriptData.extension}`,
      filters: [
        { name: 'Shell Script', extensions: ['sh'] },
        { name: 'Batch File', extensions: ['bat'] },
        { name: 'PowerShell Script', extensions: ['ps1'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!canceled && filePath) {
      await fs.writeFile(filePath, scriptData.content, { encoding: 'utf8', mode: 0o600 });
      return { success: true, path: filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error saving script:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('validate-cloudflare-api', async (event, { apiToken, domain }) => {
  try {
    if (typeof apiToken !== 'string' || typeof domain !== 'string') {
      return { success: false, error: 'Invalid input' };
    }

    const sanitizedDomain = domain.trim().toLowerCase();
    if (!sanitizedDomain || sanitizedDomain.length > 255) {
      return { success: false, error: 'Invalid domain' };
    }
    
    // First, validate the API token by getting zones
    const zonesResponse = await axios.get(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(sanitizedDomain)}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!zonesResponse.data.success) {
      return { 
        success: false, 
        error: 'Invalid API token or insufficient permissions' 
      };
    }

    const zones = zonesResponse.data.result;
    if (zones.length === 0) {
      return { 
        success: false, 
        error: `Domain '${sanitizedDomain}' not found in your Cloudflare account` 
      };
    }

    const zoneId = zones[0].id;

    // Get DNS records for the zone
    const recordsResponse = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!recordsResponse.data.success) {
      return { 
        success: false, 
        error: 'Failed to fetch DNS records' 
      };
    }

    return {
      success: true,
      zoneId: zoneId,
      records: recordsResponse.data.result.map(record => ({
        id: record.id,
        name: record.name,
        type: record.type,
        content: record.content,
        proxied: record.proxied
      }))
    };

  } catch (error) {
    console.error('API validation error:', error);
    return { 
      success: false, 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (navigationEvent, url) => {
    const isLocal = url.startsWith('file://');
    if (!isLocal) {
      navigationEvent.preventDefault();
      shell.openExternal(url);
    }
  });
});
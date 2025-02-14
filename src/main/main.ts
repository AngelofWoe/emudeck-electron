/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { exec, spawn } from 'child_process';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;
    //autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

//Prevent two instances
const gotTheLock = app.requestSingleInstanceLock();

ipcMain.on('bash', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });
    exec(
      `echo "[$(date)] ${bashCommand}" >> $HOME/emudeck/Emudeck.AppImage.log`
    );
    if (stdout) {
      exec(
        `echo "[$(date)] stdout: ${stdout}" >> $HOME/emudeck/Emudeck.AppImage.log`
      );
    }
    if (stderr) {
      exec(
        `echo "[$(date)] stderr: ${stderr}" >> $HOME/emudeck/Emudeck.AppImage.log`
      );
    }
    event.reply(backChannel, stdout);
  });
});

ipcMain.on('bash-nolog', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(`${bashCommand}`, (error, stdout, stderr) => {
    //event.reply('console', { backChannel });

    event.reply(backChannel, stdout);
  });
});

ipcMain.on('emudeck', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(
    `source ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`,
    (error, stdout, stderr) => {
      //event.reply('console', { backChannel });
      exec(
        `echo "[$(date)] ${bashCommand}" >> $HOME/emudeck/Emudeck.AppImage.log`
      );
      if (stdout) {
        exec(
          `echo "[$(date)] stdout: ${stdout}" >> $HOME/emudeck/Emudeck.AppImage.log`
        );
      }
      if (stderr) {
        exec(
          `echo "[$(date)] stderr: ${stderr}" >> $HOME/emudeck/Emudeck.AppImage.log`
        );
      }
      event.reply(backChannel, {
        stdout: stdout,
        stderr: stderr,
        error: error,
      });
    }
  );
});

ipcMain.on('emudeck-nolog', async (event, command) => {
  let backChannel;
  let bashCommand;

  if (command[0].includes('|||')) {
    const tempCommand = command[0].split('|||');
    backChannel = tempCommand[0];
    bashCommand = tempCommand[1];
  } else {
    backChannel = 'none';
    bashCommand = command;
  }

  return exec(
    `source ~/.config/EmuDeck/backend/functions/all.sh && ${bashCommand}`,
    (error, stdout, stderr) => {
      //event.reply('console', { backChannel });
      event.reply(backChannel, {
        stdout: stdout,
        stderr: stderr,
        error: error,
      });
    }
  );
});

ipcMain.on('clean-log', async (event, command) => {
  exec(`echo "[$(date)] App Installed" > $HOME/emudeck/Emudeck.AppImage.log`);
});
ipcMain.on('debug', async (event, command) => {
  mainWindow.webContents.openDevTools();
});
ipcMain.on('close', async (event, command) => {
  app.quit();
});

ipcMain.on('moreZoom', async (event, command) => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom + 0.2;
});

ipcMain.on('lessZoom', async (event, command) => {
  const currentZoom = mainWindow.webContents.getZoomFactor();
  mainWindow.webContents.zoomFactor = currentZoom - 0.2;
});

ipcMain.on('update-check', async (event, command) => {
  // Force no autoupdate
  // event.reply('update-check-out', 'up-to-date');
  // return;

  if (process.env.NODE_ENV === 'development') {
    event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
    exec(
      `echo "[$(date)] UPDATE: DEV MODE" > $HOME/emudeck/Emudeck.AppImage.log`
    );
    return;
  }

  const result = autoUpdater.checkForUpdates();
  exec(
    `echo "[$(date)] UPDATE: STARTING CHECK" > $HOME/emudeck/Emudeck.Update.log`
  );
  result
    .then((checkResult: UpdateCheckResult) => {
      const { updateInfo } = checkResult;
      console.log({ updateInfo });
      exec(
        `echo "[$(date)] UPDATE: CHECKING" >> $HOME/emudeck/Emudeck.Update.log`
      );
      //  updateInfo:
      // path: "EmuDeck-1.0.27.AppImage"
      // releaseDate: "2022-09-16T22:48:39.803Z"
      // releaseName: "1.0.27"
      // releaseNotes: "<p>IMPROVED: New Bios Check Page.<br>\nFIXED: Bug running compression tool</p>"
      // sha512: "/0ChuBwKvG7zBQQRXABssTnoCPnbG/FE4K3gqCGvfhLwfhRcIlOgIFXXu0Fqo3QF2wNz8/H3OrHfYVyplsVnJA=="
      // tag: "v1.0.27"
      // version: "1.0.27"

      const version = app.getVersion();
      const versionOnline = updateInfo.version;

      const versionCheck = version.localeCompare(versionOnline, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      //console.log({ versionCheck });
      //console.log('- 1 means update');
      //console.log('1 and 0 means up to date');
      exec(
        `echo "[$(date)] UPDATE: COMPARING VERSIONS" >> $HOME/emudeck/Emudeck.Update.log`
      );
      if (versionCheck == 1 || versionCheck == 0) {
        exec(
          `echo "[$(date)] UPDATE: UP TO DATE" >> $HOME/emudeck/Emudeck.Update.log`
        );
        console.log('Up to date, mate');
        event.reply('update-check-out', ['up-to-date', updateInfo]);
        exec(
          `echo "[$(date)] ${JSON.stringify(
            updateInfo
          )}" > $HOME/emudeck/Emudeck.AppImage.log`
        );
      } else {
        exec(
          `echo "[$(date)] UPDATE: UPDATING!" >> $HOME/emudeck/Emudeck.Update.log`
        );
        console.log('Lets update!');
        event.reply('update-check-out', ['updating', updateInfo]);
        exec(
          `echo "[$(date)] ${JSON.stringify(
            updateInfo
          )}" > $HOME/emudeck/Emudeck.AppImage.log`
        );

        const doUpdate = autoUpdater.downloadUpdate();

        doUpdate.then(() => {
          autoUpdater.quitAndInstall(
            true, // isSilent
            true // isForceRunAfter, restart app after update is installed
          );
        });
      }
    })
    .catch((reason) => {
      exec(
        `echo "[$(date)] ${JSON.stringify(
          reason
        )}" >> $HOME/emudeck/Emudeck.Update.log`
      );
    });

  //Abort the update if it hangs
  var abortPromise = new Promise(function (resolve, reject) {
    setTimeout(resolve, 10000, 'abort');
  });

  Promise.race([result, abortPromise]).then(function (value) {
    if (value == 'abort') {
      exec(
        `echo "[$(date)] UPDATE: ABORTED TIMEOUT" >> $HOME/emudeck/Emudeck.Update.log`
      );
      event.reply('update-check-out', ['up-to-date', 'DEV MODE']);
      //mainWindow.reload()
    }
  });
});

ipcMain.on('system-info-in', async (event, command) => {
  const os = require('os');
  event.reply('system-info-out', os.platform());
});

ipcMain.on('version', async (event, command) => {
  event.reply('version-out', app.getVersion());
});
ipcMain.on('branch', async (event, command) => {
  console.log(process.env);
  event.reply('branch-out', process.env.BRANCH);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const screenHeight = height < 701 ? 600 : 720;
  const isFullscreen = height < 701 ? false : false;
  const os = require('os');
  let scaleFactorW;
  let scaleFactorH;
  let dpi;
  if (os.platform() == 'darwin') {
    dpi = 2;
  } else {
    dpi = 1;
  }

  scaleFactorW = 1 / ((1280 * dpi) / width);
  scaleFactorH = 1 / ((screenHeight * dpi) / height);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280 * scaleFactorW,
    height: screenHeight,
    icon: getAssetPath('icon.png'),
    resizable: true,
    fullscreen: isFullscreen,
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    //Adjust zoom factor according to DPI or scale factor that we determined before
    console.log('Display with current scale factor: %o', scaleFactorW);
    // mainWindow.webContents.setZoomFactor(scaleFactorW);
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    const win = new BrowserWindow({ width: 1000, height: 600 });
    win.loadURL(edata.url);

    const contents = win.webContents;
    console.log(contents);

    //shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

// app.commandLine.appendSwitch('high-dpi-support', 1)
// app.commandLine.appendSwitch('force-device-scale-factor', 1)

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('session-created', (session) => {
  console.log(session);
});

// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//   sendStatusToWindow('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//   sendStatusToWindow('Update downloaded');
// });

ipcMain.on('isGameMode', async (event, command) => {
  const os = app.commandLine.hasSwitch('GameMode');
  event.reply('isGameMode-out', os);
});
let myWindow = null;
//no second instances
if (!gotTheLock) {
  app.quit();
} else {
  app.on(
    'second-instance',
    (event, commandLine, workingDirectory, additionalData) => {
      // Print out data received from the second instance.
      console.log(additionalData);

      // Someone tried to run a second instance, we should focus our window.
      if (myWindow) {
        if (myWindow.isMinimized()) myWindow.restore();
        myWindow.focus();
      }
    }
  );

  app
    .whenReady()
    .then(() => {
      createWindow();

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    })
    .catch(console.log);
}

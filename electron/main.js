const path = require('path')
const { app, BrowserWindow, ipcMain, session, shell } = require('electron')
const { autoUpdater } = require('electron-updater')

const ALLOWED_PERMISSIONS = ['clipboard-read', 'notifications', 'fullscreen', 'openExternal']

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    title: 'Celo Wallet',
    webPreferences: {
      preload: false,
      nodeIntegration: true,
      enableRemoteModule: false,
      // Security can be improved by setting contextIsolation to true
      // But it first requires all uses of nodeJs libs to be replaced with
      // partial APIs via a contextBridge in preload.js
      // Requires changes in the storage and node-hid uses
      // And also requires a window.global = globalThis hack or changing the
      // webpack target to web
      contextIsolation: false,
    },
  })

  // Open links in separate browser window
  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })

  // Load the root page of the app
  mainWindow.loadFile('index.html')

  // Open the DevTools. Note this seems to be broken by CSP header below, disable header as needed during dev
  // mainWindow.webContents.openDevTools()

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
  })
}

function setCspHeader() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Should match header in /netlify/_headers
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'sha256-a0xx6QQjQFEl3BVHxY4soTXMFurPf9rWKnRLQLOkzg4='; connect-src 'self' https://*.celowallet.app https://*.celo.org https://*.celo-testnet.org; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self'; form-action 'self'",
        ],
      },
    })
  })
}

function setPermissionsHandler() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (ALLOWED_PERMISSIONS.includes(permission)) {
      // Approves the permissions request
      callback(true)
    } else {
      // Denies the permissions request
      return callback(false)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  setCspHeader()
  setPermissionsHandler()
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  app.quit()
})

// Set up IPC to pass data path into renderer process
// Tries prevents need to enable remote module
const appMetadata = {
  defaultCwd: app.getPath('userData'),
  appVersion: app.getVersion(),
}
ipcMain.on('get-app-metadata', (event) => {
  event.returnValue = appMetadata
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

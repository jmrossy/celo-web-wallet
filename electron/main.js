// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require('electron')
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
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

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // TODO disable
  // Open the DevTools. Note this seems to be broken by CSP header below, disable header as needed during dev
  mainWindow.webContents.openDevTools()
}

function setCspHeader() {
  // TODO set this in index.html for packaged app version?
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Should match header in /netlify/_headers
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'sha256-urr87uaD48g6MXBVNeR78sfcWLvwaTmaTVi34sSPRWA='; connect-src 'self' https://*.celowallet.app https://*.celo.org https://*.celo-testnet.org; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self'; form-action 'self'",
        ],
      },
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // setCspHeader()

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

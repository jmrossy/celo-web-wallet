const { app, BrowserWindow, ipcMain, session, shell } = require('electron')
const { autoUpdater } = require('electron-updater')

const URL_SCHEME = 'celowallet'
const ALLOWED_PERMISSIONS = [
  'clipboard-read',
  'notifications',
  'fullscreen',
  'openExternal',
  'persistent-storage',
]

let mainWindow
let deeplinkUrl

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 760,
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

  mainWindow.removeMenu()

  // Open links in separate browser window
  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  // Load the root page of the app
  mainWindow.loadFile('index.html')

  // Open the DevTools. Note this seems to be broken by CSP header below, disable header as needed during dev
  // mainWindow.webContents.openDevTools()

  // Set up auto-updater
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setCspHeader() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Should match header in /netlify/_headers and build.sh
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'sha256-a0xx6QQjQFEl3BVHxY4soTXMFurPf9rWKnRLQLOkzg4='; connect-src 'self' https://*.celowallet.app https://*.celo.org wss://walletconnect.celo.org wss://*.walletconnect.org https://api.github.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; base-uri 'self'; form-action 'self'",
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

function setupDeepLinking() {
  // Declare app as owner of url scheme
  // Must match scheme in electron-builder.yml
  app.setAsDefaultProtocolClient(URL_SCHEME)

  app.on('will-finish-launching', () => {
    // Set up URL scheme handler for Mac
    app.on('open-url', (event, url) => {
      event.preventDefault()
      console.info('URL Opened', url)
      deeplinkUrl = url
      if (mainWindow && deeplinkUrl) {
        mainWindow.webContents.send('new-app-deeplink', deeplinkUrl)
      }
    })
  })

  // open-url only works on Mac
  // For windows and linux, listen for new instances and check argv
  app.on('second-instance', (e, argv) => {
    if (process.platform == 'win32' || process.platform === 'linux') {
      console.info('second instance opened')
      deeplinkUrl = argv.find((arg) => arg && arg.startsWith(`${URL_SCHEME}://`))
      console.info('url found:', deeplinkUrl)
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      if (deeplinkUrl) mainWindow.webContents.send('new-app-deeplink', deeplinkUrl)
    }
  })

  // Note, this line only works for windows (and maybe linux)
  // Mac initial deep links are caught by open-url above
  deeplinkUrl = process.argv.find((arg) => arg && arg.startsWith(`${URL_SCHEME}://`))
}

// Only allow a single running instance
// This facilitates deep-linking
const lockAquired = app.requestSingleInstanceLock()
if (!lockAquired) {
  app.quit()
} else {
  setupDeepLinking()
  // Called when Electron finished initialization and is ready to create windows
  // Some APIs can only be used after this event occurs
  app.whenReady().then(() => {
    setCspHeader()
    setPermissionsHandler()
    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  // Shutdown app when all browser windows are closed
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
  ipcMain.on('get-app-deeplink', (event) => {
    event.returnValue = deeplinkUrl || null
  })
  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall()
  })
}

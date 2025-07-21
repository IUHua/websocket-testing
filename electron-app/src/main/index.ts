import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { execFile } from 'child_process'
import path from 'path'
import fs from 'fs'

// 后端服务进程
let backendProcess: any = null

// 加载完成？

function startBackendServer() {
    const backendPath = app.isPackaged
        ? path.join(process.resourcesPath, 'backend-macos') // 生产环境
        : path.join(__dirname, '../../resources/backend-macos') // 开发环境

    console.log('启动后端程序，路径:', backendPath)

    try {
        // 2. [重要] 在 macOS 和 Linux 上，确保文件有执行权限
        if (process.platform !== 'win32') {
            fs.chmodSync(backendPath, '755')
        }
        // dialog.showMessageBox({
        //     type: 'info',
        //     title: '后端程序启动',
        //     message: '后端程序已启动'
        // })
        // 3. 使用 execFile 启动后端进程
        backendProcess = execFile(backendPath, (error, stdout, stderr) => {
            if (error) {
                console.error(`后端进程执行出错: ${error.message}`)
                // 可以在这里通过对话框通知用户
                // dialog.showErrorBox('后端进程启动失败', error.message)
                return
            }
            if (stderr) {
                console.error(`后端进程标准错误: ${stderr}`)
                return
            }
            console.log(`后端进程标准输出: ${stdout}`)
        })

        backendProcess.on('close', (code) => {
            console.log(`后端进程已退出，退出码 ${code}`)
            // 可以根据需要处理重启逻辑
        })
    } catch (err) {
        console.error('无法启动后端进程:', err)
    }
}

function createWindow(): void {
    // 启动后端服务

    // 创建浏览器窗口...
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// 应用退出时关闭后端服务
app.on('will-quit', () => {
    if (backendProcess) {
        console.log('关闭后端服务')
        backendProcess.kill()
        backendProcess = null
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    startBackendServer()

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    // ipcMain.on('ping', () => console.log('pong'))

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
const csv = require('csvtojson');
const moment = require('moment');
const fs = require('fs');
var LineReader = require('linereader');
var csvWriter = require('csv-write-stream')
var ipc = require('electron').ipcMain;
const os = require('os')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const ArrayOfPeople = {};
var Transactions = { data: [] };

const TBRMain = (csvFilePath) => {
  let json = []
  let person = ''
  csv()
    .fromFile(path.join(__dirname, csvFilePath))
    .then((jsonObj) => {
      json = jsonObj;
      for (let x = 0; x < json.length; x++) {
        const element = json[x]
        const newObj = {}
        if (element['Row Type'] === '0') {
          ArrayOfPeople[element.Date] = {};
          person = element.Date
        }
      }
      return json;
    }).then((json) => {
      for (let x = 0; x < json.length; x++) {
        const element = json[x]
        if (element['Row Type'] === '0') {
          person = element.Date
        }
        if (element['Row Type'] === '1') {
          if (element.Date.indexOf('-') > -1) {
            let startDate = element.Date.split(' - ')[0]
            let endDate = element.Date.split(' - ')[1]
            let datearray = [element['Hours Worked'], element['Last Out - First In'], [startDate + "  " + element['First In'], endDate + "  " + element['Last Out']]]
            ArrayOfPeople[person][element.Date] = datearray
          }
          else {
            let datearray = [element['Hours Worked'], element['Last Out - First In'], [element.Date + " " + element['First In'], element.Date + " " + element['Last Out']]]
            ArrayOfPeople[person][element.Date] = datearray
          }
        }
        if (element['Row Type'] === '2') {
          let datearray = [element['Hours Worked'], element['Last Out - First In'], []]
          ArrayOfPeople[person]['Totals'] = datearray
        }
      }
    })
    .then(() => {
      const JSONString = JSON.stringify(ArrayOfPeople);
      fs.writeFile("TBRdata.json", JSONString, function (err) {
        if (err) throw err;
      })
    })
    .then(() => {
      return ArrayOfPeople
    })
    .catch(err => console.log("error: TBR ", err))
}

const TRMain = async (csvFilePath) => {
  await csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      for (let x = 0; x < jsonObj.length; x++) {
        if (jsonObj[x]['Event Name'] === 'Allowed Normal In' || jsonObj[x]['Event Name'] === 'Allowed Normal Out') {
          let employee = jsonObj[x]['Display Name **']
          Transactions.data.push([employee, jsonObj[x]['Date/Time'].split(' ')[0].replace(/-/g, "/"), jsonObj[x]['Date/Time'].split(' ')[0].replace(/-/g, "/") + " " + jsonObj[x]['Date/Time'].split(' ')[1]])
        }
      }
    })
    .then(() => {
      const JSONString = JSON.stringify(Transactions);
      fs.writeFile("TRdata.json", JSONString, function (err) {
        if (err) throw err;
      })
    })
    .catch(err => console.log("error TRMain: ", err))
}



async function TBRProcessing(csvTBRFilePath) {
  // const csvTBRFilePath='./TBR.csv'
  await TBRMain(csvTBRFilePath);
}

async function TRProcessing(csvTRFilePath) {
  let TRObject = TRMain(csvTRFilePath);
  return TRObject;
}

async function writeNewFile(AOP) {
  var writer = csvWriter({ headers: ["Employee", "Date", "Hours Worked", "Hours in Zone", "Punches", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] })
  writer.pipe(fs.createWriteStream('out.csv'))
  Object.keys(AOP).forEach(employee => {
    let line = [employee]
    Object.keys(AOP[employee]).forEach(key => {
      let date = key
      let hrsWrk = AOP[employee][key][0]
      let fInLout = AOP[employee][key][1]
      let punches = []
      let finalArray = [employee, date, hrsWrk, fInLout]
      for (let y = 0; y < AOP[employee][key][2].length; y++) {
        punches.push(new Date(AOP[employee][key][2][y]))
      }
      punches = punches.sort()
      punches.forEach((element => {
        finalArray.push(moment(element).format("HH:MM:ss"))
      }))
      writer.write(finalArray)
    })
  })
  writer.end()
}



async function Process() {
  console.log("Process AOP")
  AOP = ArrayOfPeople
  Trans = Transactions.data
  TransLength = Trans.length

  Object.keys(AOP).forEach(employee => {
    Object.keys(AOP[employee]).forEach(key => {
      let firstIn = AOP[employee][key][2][0]
      let lastOut = AOP[employee][key][2][1]
      if (key.indexOf('-') > -1) {
        let startdate = key.split('-')[0].trim()
        let enddate = key.split('-')[1].trim()
        for (d = 0; d < Trans.length; d++) {
          if (Trans[d][0] === employee) {
            if (Trans[d][1] === startdate) {
              if (moment(new Date(Trans[d][2])).isAfter(moment(new Date(firstIn))) && moment(new Date(Trans[d][2])).isBefore(moment(new Date(lastOut)))) {
                AOP[employee][key][2].splice(AOP[employee][key][2].length - 1, 0, Trans[d][2])
              }
            }
            if (Trans[d][1] === enddate) {
              if (moment(new Date(Trans[d][2])).isAfter(moment(new Date(firstIn))) && moment(new Date(Trans[d][2])).isBefore(moment(new Date(lastOut)))) {
                AOP[employee][key][2].splice(AOP[employee][key][2].length - 1, 0, Trans[d][2])
              }
            }
          }
        }
      }
      else {
        for (d = 0; d < Trans.length; d++) {
          if (Trans[d][0] === employee) {
            if (Trans[d][1] === key) {
              if (moment(new Date(Trans[d][2])).isAfter(moment(new Date(firstIn))) && moment(new Date(Trans[d][2])).isBefore(moment(new Date(lastOut)))) {
                AOP[employee][key][2].splice(AOP[employee][key][2].length - 1, 0, Trans[d][2])
              }
            }
          }
        }
      }
    })
  });
  await writeNewFile(AOP)
}

async function RewriteFile(orignalFile, NewFile) {
  return new Promise(async (resolve, reject) => {
    let read = false;
    var lr = new LineReader(orignalFile);
    await lr.on('line', function (lineno, line) {
      lr.on('error', function (err) {
        reject(err);
        lr.close();
      });
      if (line.includes(`"Appendix A"`)) {
        read = false;
      }
      if (read === true) {
        fs.appendFile(NewFile, '\n' + line, (err, data) => {
          if (err) {
            throw err
          }
        })
      }
      if (line.includes(`Row Type",`)) {
        fs.writeFile(NewFile, line, (err) => {
          if (err) {
            throw err
          }
        });
        read = true
      }
      if (line.includes(`"Date/Time",`)) {
        fs.writeFile(NewFile, line, (err) => {
          if (err) {
            throw err
          }
        });
        read = true
      }
    })
    lr.on('end', function () {
      console.log("End");
      resolve();
    });


  })
}

function processOldFiles(tbrFile, trFile) {
  return new Promise(async (resolve, reject) => {
    try {
      await RewriteFile(tbrFile, './TBR.csv')
      .then(()=>{
        RewriteFile(trFile, './TR.csv')
        .then(()=>{
          resolve()
        });
      });
    }
    catch (err) {
      console.log("Process Old Files error ", err)
      reject(err)
    }
  })
}



async function Main(tbrFile, trFile, data) {
  try {
    await processOldFiles(tbrFile, trFile)
      .then(async () => {
        await TBRProcessing('TBR.csv');
        await TRProcessing('TR.csv')
        await Process(ArrayOfPeople);
      }).catch((err) => { console.log("Processing :") })
  }
  catch (err) {
    console.log("error Main: ", err)
  }
}

ipc.on('test', function (e, item) {
  Main(item[1], item[3], item)
})
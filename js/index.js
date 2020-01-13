const electron = require('electron');
const { ipcRenderer } = electron;

document.querySelector('form').addEventListener('submit', submitForm);


function submitForm(e) {
    e.preventDefault();
    let tbrPath = document.getElementById("TBRInputFile").files[0].path; 
    let trPath = document.getElementById("TRInputFile").files[0].path;
    let tbrFile = document.getElementById("TBRInputFile").files[0].name; 
    let trFile = document.getElementById("TRInputFile").files[0].name;
    console.log(ipcRenderer);
    ipcRenderer.send('test', [tbrFile,tbrPath,trFile,trPath]);
}
const electron = require('electron');
const { ipcRenderer } = electron;

document.querySelector('form').addEventListener('submit', submitForm);


function submitForm(e) {
    e.preventDefault();
    let tbrPath = document.getElementById("TBRInputFile").files[0].path; 
    let trPath = document.getElementById("TRInputFile").files[0].path;
    let tbrFile = document.getElementById("TBRInputFile").files[0].name; 
    let trFile = document.getElementById("TRInputFile").files[0].name;
    
    ipcRenderer.send('test', [tbrFile,tbrPath,trFile,trPath]);
    document.getElementById('loader').classList.remove('hide')
    document.getElementById('form').classList.add('hide');
    setTimeout(()=>{
        document.getElementById('loader').classList.add('hide');

        document.getElementById('Completed').classList.remove('hide')
    },10000)
}

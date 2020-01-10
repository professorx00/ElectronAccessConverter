const csv = require('csvtojson')
const moment = require('moment')
const fs = require('fs');
let json = []
const ArrayOfPeople = {}
let person = ''
const TRMain = (csvFilePath,AOP) => {
    fs.Stats('data.json')
    csv()
        .fromFile(csvFilePath)
        .then((jsonObj) => {
            // console.log(jsonObj)
        })
}

module.exports.TRMain = TRMain;
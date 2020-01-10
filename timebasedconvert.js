
const csv = require('csvtojson')
const moment = require('moment')
const fs = require('fs');
let json = []
const ArrayOfPeople = {}
let person = ''
const TBRMain = (csvFilePath) => {
    csv()
        .fromFile(csvFilePath)
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
                    let datearray = [element['Hours Worked'], element['Last Out - First In'], [element['First In'], element['Last Out']]]
                    ArrayOfPeople[person][element.Date] = datearray
                }
                if(element['Row Type']==='2'){
                    let datearray = [element['Hours Worked'], element['Last Out - First In'], [element['First In'], element['Last Out']]]
                    ArrayOfPeople[person]['Totals'] = datearray
                }
            }
        }).then(() => {
            const JSONString = JSON.stringify(ArrayOfPeople);
            fs.writeFile ("data.json", JSONString, function(err) {
                if (err) throw err;
                console.log('complete');
                })
        })
}


module.exports.TBRMain = TBRMain;

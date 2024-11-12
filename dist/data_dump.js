import mysql from "mysql2";
import axios from "axios";
import fs from "fs";
import translate from "translate";
import csv from "csv-parser";
// configuration variables
const lld_pw = process.env.LLD_PW;
const pool = mysql
    .createPool({
    host: "localhost",
    user: "root",
    password: lld_pw,
    database: "lld",
})
    .promise();
translate.engine = "google";
// translates word to spanish and korean
async function translateWord(word) {
    try {
        const spanish = await translate("the " + word, { to: "es" });
        const korean = await translate("the " + word, { to: "ko" });
        return [spanish, korean, word];
    }
    catch (error) {
        return null;
    }
}
// fetches word information from WordsAPI
async function fetchWord(english) {
    const options = {
        method: "GET",
        url: `https://wordsapiv1.p.rapidapi.com/words/${english}`,
        headers: {
            "x-rapidapi-key": "b990592d51msh5e1029396589d1bp18dd72jsnce5f8c3e8b6c",
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        },
    };
    try {
        const response = await axios.request(options);
        const data = response.data;
        const translations = await translateWord(english);
        const spanish = translations[0], korean = translations[1], freq = data.frequency, pronunciation = data.pronunciation.all;
        let definition = "";
        for (const def of data.results) {
            if (def.partOfSpeech == "noun") {
                definition = def.definition;
                break;
            }
        }
        if (freq && english && pronunciation && spanish && korean)
            return [
                `\"${english}\"`,
                "NULL",
                freq,
                `\"${pronunciation}\"`,
                `\"${spanish}\"`,
                `\"${korean}\"`,
                `\"${definition}\"`,
            ];
        return null;
    }
    catch (error) {
        return null;
    }
}
// adds sql query to add new row
async function appendToInsert(word) {
    const results = await fetchWord(word);
    if (results) {
        return "(" + results.join(", ") + "),";
    }
    return null;
}
// reads CSV file with in-built file system library
async function readCSV() {
    const columns_placeholder = "(english, diff, freq, pronunciation, spanish, korean, def)";
    let inserts = "";
    let insertPromises = [];
    const csvStream = fs.createReadStream("nounlist.csv").pipe(csv());
    csvStream.on("data", (row) => {
        insertPromises.push(appendToInsert(row.english_word).then((insert) => {
            if (insert)
                inserts += insert;
        }));
    });
    await new Promise((resolve) => csvStream.on("end", resolve));
    console.log("Finished reading, waiting for promises...");
    await Promise.all(insertPromises);
    console.log("Finished resolving promises");
    inserts = inserts.slice(0, -1);
    const query = `INSERT INTO words ${columns_placeholder} VALUES ${inserts}`;
    await pool.query(query);
    console.log("Data inserted into table");
}
readCSV();
//# sourceMappingURL=data_dump.js.map
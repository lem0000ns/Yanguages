import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import mysql, { RowDataPacket } from "mysql2/promise";

// configuration variables
const lld_pw = process.env.LLD_PW;
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: lld_pw,
  database: "lld",
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

interface Word extends RowDataPacket {
  english: string;
}

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  console.log("HI");
});

const getAPIword = async (diff: string, res) => {
  try {
    let query = "";
    if (diff != "") {
      query = `SELECT * FROM words WHERE diff = '${diff}' ORDER BY RAND() LIMIT 1`;
    } else {
      query = `SELECT * FROM words ORDER BY RAND() LIMIT 1`;
    }
    const [results] = await pool.query<Word[]>(query);
    const words = results.map((result) => ({
      english: result.english,
      spanish: result.spanish,
      korean: result.korean,
      freq: result.freq,
      diff: result.diff,
      pronunciation: result.pronunciation,
      def: result.def,
    }));
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { error } });
  }
};

const getAnswers = async (diff: string, res) => {
  try {
    const query = `SELECT * FROM words WHERE diff = '${diff}' ORDER BY RAND() LIMIT 3`;
    const [results] = await pool.query<Word[]>(query);
    const words = results.map((result) => ({
      english: result.english,
    }));
    res.json(words);
  } catch (error) {
    res.status(500).json({ error: { error } });
  }
};

app.get("/api/word/easy", (req, res) => getAPIword("easy", res));
app.get("/api/word/med", (req, res) => getAPIword("med", res));
app.get("/api/word/hard", (req, res) => getAPIword("hard", res));
app.get("/api/answers/easy", (req, res) => getAnswers("easy", res));
app.get("/api/answers/med", (req, res) => getAnswers("med", res));
app.get("/api/answers/hard", (req, res) => getAnswers("hard", res));
app.get("/api/word", (req, res) => getAPIword("", res));

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

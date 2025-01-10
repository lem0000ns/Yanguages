import express from "express";
import path from "path";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import { fileURLToPath } from "url";
import mysql, { RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import type { IGetUserAuthInfoRequest } from "./request.js";
import bcrypt from "bcrypt";

// configuration variables
const lld_pw = process.env.LLD_PW;
const lld_pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: lld_pw,
  database: "lld",
});
const usr_pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: lld_pw,
  database: "lld_usrs",
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(session({ secret: "secret", resave: false, saveUnitialized: false })); // middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const result = await usr_pool.query(
        `SELECT * FROM usrs WHERE username = '${username}'`
      );
      if ((<any>result[0]).length == 0) {
        console.log("Incorrect username");
        return done(null, false, { message: "Incorrect username" });
      }
      const user = result[0];
      bcrypt.compare(password, (user as any)[0].password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return done(null, false, { message: "Incorrect password" });
        }
        if (!result) {
          console.error("Incorrect password");
          return done(null, false, { message: "Incorrect passsword" });
        }
        return done(null, user);
      });
    } catch (err) {
      console.error(`Error: ${err}`);
      return done(null, false, { message: err.message });
    }
  })
);

// called after successful authentication
passport.serializeUser((user, done) => {
  console.log("Serializing user");
  done(null, user[0].id);
});

// used when user makes request
passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user");
  try {
    // find user in database with corresponding id
    const result = await usr_pool.query(
      `SELECT * FROM usrs WHERE id = ${id} LIMIT 1`
    );
    if ((<any>result[0]).length == 0) {
      return done(null, false);
    }
    const user = result[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Successful login" });
});

app.post("/register", async (req, res) => {
  console.log("Received a POST request to /register");
  try {
    const { username, password } = req.body;
    console.log(username);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = `INSERT INTO usrs (username, password) VALUES ('${username}', '${hashedPassword}')`;
    await usr_pool.query(query);
    res.status(200).json({ message: "User registered into database" });
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.get("/logout", (req: IGetUserAuthInfoRequest, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  res.status(200).json({ message: "Successfully logged out" });
});

interface Word extends RowDataPacket {
  english: string;
}

interface Score extends RowDataPacket {
  sp_easy: number;
  sp_med: number;
  sp_hard: number;
  kr_easy: number;
  kr_medd: number;
  kr_hard: number;
}

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
    const [results] = await lld_pool.query<Word[]>(query);
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
    const [results] = await lld_pool.query<Word[]>(query);
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

app.get(`/highscore/:username`, async (req, res) => {
  try {
    const username = req.params.username;
    const query = `SELECT sp_easy, sp_med, sp_hard, kr_easy, kr_med, kr_hard FROM usrs WHERE username="${username}"`;
    const [results] = await usr_pool.query<Score[]>(query);
    res.json(results);
  } catch (e) {
    console.error("Error, ", e);
  }
});

app.post("/highscore", async (req, res) => {
  try {
    const { lang, diff, streak, username } = req.body;
    const result = await usr_pool.query(
      `SELECT ${lang}_${diff} FROM usrs WHERE username = "${username}"`
    );
    const curScore = result[0][0][`${lang}_${diff}`];
    if (streak > curScore) {
      await usr_pool.query(
        `UPDATE usrs SET ${lang}_${diff} = ${streak} WHERE username = "${username}"`
      );
      res.status(200).json({ message: "High score successfully updated" });
    } else {
      res.status(200).json({ message: "No high score update" });
    }
  } catch (e) {
    console.error("Error updating high score, ", e);
    res.status(500).json({ message: "Error updating high score" });
  }
});

app.post("/dictionary", async (req, res) => {
  try {
    const { username, term, define, sentence, lang } = req.body;
    await usr_pool.query(
      `INSERT INTO dict (username, term, define, sentence, lang) VALUES ("${username}", "${term}", "${define}", "${sentence}", "${lang}")`
    );
    res.status(200).json({ message: "Added!" });
  } catch (e) {
    console.error("Error updating personal dictionary, ", e);
    res.status(500).json({ message: "Error updating personal dictionary" });
  }
});

app.put("/dictionary", async (req, res) => {
  try {
    const { id, username, term, define, sentence, lang } = req.body;
    await usr_pool.query(
      `UPDATE dict SET term = "${term}", define = "${define}", sentence = "${sentence}", lang = "${lang}" WHERE id = ${id} AND username = "${username}"`
    );
    res.status(200).json({ message: "Added!" });
  } catch (e) {
    console.error("Error updating personal dictionary, ", e);
    res.status(500).json({ message: "Error updating personal dictionary" });
  }
});

app.get("/dictionary/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const query = `SELECT id, term, define, sentence FROM dict WHERE username = "${username}"`;
    const results = await usr_pool.query(query);
    res.json(results);
  } catch (e) {
    console.error("Error retrieving personal dictionary, ", e);
    res.status(500).json({ message: "Error retrieving personal dictionary" });
  }
});

app.delete("/dictionary", async (req, res) => {
  try {
    const { deleteIds } = req.body;
    console.log(deleteIds);
    if (deleteIds.length > 0) {
      const temp = deleteIds.map((num) => `id=${num}`);
      const tempS = temp.join(" OR ");
      await usr_pool.query(`DELETE FROM dict WHERE ${tempS}`);
      res.status(200).json({ message: "Successfully deleted dictionary item" });
    } else {
      res.status(200).json({ message: "No dictionary items were deleted" });
    }
  } catch (e) {
    console.error("Error deleting dictionary item, ", e);
    res.status(500).json({ message: "Error deleting dictionary item" });
  }
});

app.post("/diary", async (req, res) => {
  try {
    const { username, title, entry, date } = req.body;
    const [rows, fields] = await usr_pool.query(
      `SELECT * FROM diaries WHERE username="${username}" AND date="${date}"`
    );
    console.log("TEMP:");
    console.log(rows);
    // already exists, update
    if (Array.isArray(rows) && rows.length > 0) {
      await usr_pool.query(
        `UPDATE diaries SET title="${title}", entry="${entry}" WHERE username="${username}" AND date="${date}"`
      );
    }
    // doesn't exist, insert
    else {
      await usr_pool.query(
        `INSERT INTO diaries (username, title, entry, date) VALUES ("${username}", "${title}", "${entry}", "${date}")`
      );
    }
    res.status(200).json({ message: "Saved!" });
  } catch (e) {
    console.error("Error updating diary", e);
    res.status(500).json({ message: "Error updating diary" });
  }
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

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

export const dynamic = "force-dynamic";

// configuration variables
const lld_pw = process.env.LLD_PW;
const lld_pool = mysql.createPool({
  host: "db-yanguages.c30igyqguxod.us-west-1.rds.amazonaws.com",
  user: "root",
  password: lld_pw,
  database: "lld",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(session({ secret: "secret", resave: false, saveUninitialized: false })); // middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const result = await lld_pool.query(
        "SELECT * FROM usrs WHERE username = ?",
        [username]
      );
      if ((<any>result[0]).length == 0) {
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
    const result = await lld_pool.query(
      "SELECT * FROM usrs WHERE id = ? LIMIT 1",
      [id]
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
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await lld_pool.query(
      "INSERT INTO usrs (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
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
  kr_med: number;
  kr_hard: number;
  zh_easy: number;
  zh_med: number;
  zh_hard: number;
}

app.get("/", (req, res) => {
  console.log("Listening");
  res.send("Yanguages Backend Running");
});

const getAPIword = async (diff: string, res) => {
  let results: Word[] = [];
  try {
    if (diff != "") {
      [results] = await lld_pool.query<Word[]>(
        "SELECT * FROM words WHERE diff = ? ORDER BY RAND() LIMIT 1",
        [diff]
      );
    } else {
      [results] = await lld_pool.query<Word[]>(
        "SELECT * FROM words ORDER BY RAND() LIMIT 1"
      );
    }
    const words = results.map((result) => ({
      english: result.english,
      spanish: result.spanish,
      korean: result.korean,
      chinese: result.chinese,
      freq: result.freq,
      diff: result.diff,
      pronunciation: result.pronunciation,
      def: result.def,
      pinyin: result.pinyin,
    }));
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { error } });
  }
};

const getOptions = async (diff: string, res) => {
  try {
    const [results] = await lld_pool.query<Word[]>(
      "SELECT * FROM words WHERE diff = ? ORDER BY RAND() LIMIT 3",
      [diff]
    );
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
app.get("/api/options/easy", (req, res) => getOptions("easy", res));
app.get("/api/options/med", (req, res) => getOptions("med", res));
app.get("/api/options/hard", (req, res) => getOptions("hard", res));
app.get("/api/word", (req, res) => getAPIword("", res));

app.get(`/highscore/:username`, async (req, res) => {
  try {
    const username = req.params.username;
    const [results] = await lld_pool.query<Score[]>(
      "SELECT sp_easy, sp_med, sp_hard, kr_easy, kr_med, kr_hard, zh_easy, zh_med, zh_hard FROM usrs WHERE username = ?",
      [username]
    );
    res.json(results);
  } catch (e) {
    console.error("Error, ", e);
  }
});

app.post("/highscore", async (req, res) => {
  try {
    const { lang, diff, streak, username } = req.body;
    const mode = lang + "_" + diff;
    const result = await lld_pool.query(
      `SELECT ${mode} FROM usrs WHERE username = ?`,
      [username]
    );
    const curScore = result[0][0][`${lang}_${diff}`];
    if (streak > curScore) {
      await lld_pool.query(`UPDATE usrs SET ${mode} = ? WHERE username = ?`, [
        streak,
        username,
      ]);
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
    await lld_pool.query(
      "INSERT INTO dict (username, term, define, sentence, lang) VALUES (?, ?, ?, ?, ?)",
      [username, term, define, sentence, lang]
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
    const tempLang = lang == "None" ? "" : lang;
    await lld_pool.query(
      "UPDATE dict SET term = ?, define = ?, sentence = ?, lang = ? WHERE id = ? AND username = ?",
      [term, define, sentence, tempLang, id, username]
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
    const results = await lld_pool.query(
      "SELECT id, term, define, sentence, lang FROM dict WHERE username = ?",
      [username]
    );
    res.json(results);
  } catch (e) {
    console.error("Error retrieving personal dictionary, ", e);
    res.status(500).json({ message: "Error retrieving personal dictionary" });
  }
});

app.get("/dictionary/:lang/:username", async (req, res) => {
  try {
    const lang = req.params.lang.toLowerCase();
    const username = req.params.username;
    const results = await lld_pool.query(
      "SELECT id, term, define, sentence, lang FROM dict WHERE username = ? AND lang = ?",
      [username, lang]
    );
    res.json(results);
  } catch (e) {
    console.error("Error retrieving personal dictionary, ", e);
    res.status(500).json({ message: "Error retrieving personal dictionary" });
  }
});

app.delete("/dictionary", async (req, res) => {
  try {
    const { deleteIds } = req.body;
    if (deleteIds.length > 0) {
      const temp = deleteIds.map((num) => `id=${num}`);
      const tempS = temp.join(" OR ");
      await lld_pool.query(`DELETE FROM dict WHERE ${tempS}`);
      res.status(200).json({ message: "Successfully deleted dictionary item" });
    } else {
      res.status(200).json({ message: "No dictionary items were deleted" });
    }
  } catch (e) {
    console.error("Error deleting dictionary item, ", e);
    res.status(500).json({ message: "Error deleting dictionary item" });
  }
});

interface Tag extends RowDataPacket {
  id: number;
}

app.post("/diary", async (req, res) => {
  try {
    const { username, title, entry, date, diaryTags } = req.body;
    const [rows, fields] = await lld_pool.query(
      "SELECT * FROM diaries WHERE username = ? AND date = ?",
      [username, date]
    );
    // already exists, update
    if (Array.isArray(rows) && rows.length > 0) {
      await lld_pool.query(
        "UPDATE diaries SET title = ?, entry = ? WHERE username = ? AND date = ?",
        [title, entry, username, date]
      );
      // resetting tags
      await lld_pool.query("DELETE FROM tags WHERE username = ? AND date = ?", [
        username,
        date,
      ]);
    }
    // doesn't exist, insert
    else {
      await lld_pool.query(
        "INSERT INTO diaries (username, title, entry, date) VALUES (?, ?, ?, ?)",
        [username, title, entry, date]
      );
    }
    // update tags by iterating through diaryTags
    const [temp] = await lld_pool.execute<Tag[]>(
      "SELECT id FROM diaries WHERE username = ? AND date = ?",
      [username, date]
    );
    if (Array.isArray(temp) && temp.length > 0) {
      const diaryId = temp[0].id;
      for (var i = 0; i < diaryTags.length; i++) {
        await lld_pool.query(
          "INSERT INTO tags (diaryId, username, date, tag) VALUES (?, ?, ?, ?)",
          [diaryId, username, date, diaryTags[i]]
        );
      }
    }
    res.status(200).json({ message: "Saved!" });
  } catch (e) {
    console.error("Error updating diary", e);
    res.status(500).json({ message: "Error updating diary" });
  }
});

app.get("/tags/", async (req, res) => {
  try {
    const username = req.query.username;
    const searchTags = (req.query.searchTags as string).split(",");
    let temp = "";
    for (let i = 0; i < searchTags.length; i++) {
      temp += `tags.tag="${searchTags[i]}" OR `;
    }
    temp = temp.substring(0, temp.length - 4);
    const results = await lld_pool.query(
      `SELECT diaries.id, diaries.date, diaries.title, diaries.entry FROM diaries INNER JOIN tags ON diaries.id = tags.diaryId WHERE tags.username=? AND (${temp})`,
      [username]
    );
    res.status(200).json(results);
  } catch (e) {
    console.error("error retrieving diary entries with tags", e);
    res
      .status(500)
      .json({ message: "Error retrieving diary entries with specified tags" });
  }
});

app.get("/diary/:username/:date", async (req, res) => {
  try {
    const username = req.params.username;
    const date = req.params.date;
    const [temp] = await lld_pool.execute<Tag[]>(
      "SELECT id, title, entry FROM diaries WHERE username = ? AND date = ?",
      [username, date]
    );
    if (Array.isArray(temp) && temp.length > 0) {
      const diaryId = temp[0].id;
      const [result] = await lld_pool.query(
        "SELECT tag FROM tags WHERE diaryId=?",
        [diaryId]
      );
      var diaryTags = [];
      for (var i in result) {
        diaryTags.push(result[i].tag);
      }
      const results = { ...temp, diaryTags };
      res.status(200).json(results);
    } else {
      res.status(500).json({ message: `No diary for ${date}` });
    }
  } catch (e) {
    console.error("Error retrieving personal dictionary, ", e);
    res.status(500).json({ message: "Error retrieving personal dictionary" });
  }
});

app.delete("/diary", async (req, res) => {
  try {
    const { username, date } = req.body;
    await lld_pool.query("DELETE FROM diaries WHERE username=? AND date=?", [
      username,
      date,
    ]);
    res.status(200).json({ message: "Successfully deleted diary entry" });
  } catch (e) {
    res.status(500).json({ message: "Problem deleting diary entry" });
  }
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

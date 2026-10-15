import express, { type NextFunction, type Response } from "express";
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

const allowedOrigins = [
  ...new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.yanguages.com",
    "https://yanguages.com",
    ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : []),
    ...(process.env.FRONTEND_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []),
  ]),
];

const crossSiteFrontend =
  process.env.CROSS_SITE_COOKIES === "true" ||
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.RAILWAY_ENVIRONMENT);

if (crossSiteFrontend) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin ?? true);
      } else {
        console.warn("CORS blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? lld_pw ?? "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: crossSiteFrontend ? "none" : "lax",
      secure: crossSiteFrontend,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
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

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
}

function sessionUsername(req: IGetUserAuthInfoRequest) {
  const rows = req.user as UserRow[] | undefined;
  const name = rows?.[0]?.username;
  return typeof name === "string" ? name.trim() : undefined;
}

function requireAuth(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  if (!sessionUsername(req)) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  next();
}

const WORD_DIFFS = new Set(["easy", "med", "hard"]);

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

/** Strip wrapping quotes Railway/UI sometimes add to env values. */
function parseEditorEntry(entry: string) {
  let s = entry.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return normalizeUsername(s);
}

function wordEditorUsernames() {
  const raw = process.env.WORD_EDITOR_USERNAMES ?? "";
  return new Set(
    raw
      .split(",")
      .map(parseEditorEntry)
      .filter(Boolean)
  );
}

function canEditWords(username: string | undefined) {
  if (!username) return false;
  return wordEditorUsernames().has(normalizeUsername(username));
}

function requireWordEditor(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  const username = sessionUsername(req);
  if (!username) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (!canEditWords(username)) {
    res.status(403).json({ message: "Not authorized to edit the word catalog" });
    return;
  }
  next();
}

app.post("/login", passport.authenticate("local"), (req: IGetUserAuthInfoRequest, res) => {
  const username = sessionUsername(req);
  res.json({
    message: "Successful login",
    username,
    canEditWords: canEditWords(username),
  });
});

app.get("/me", (req: IGetUserAuthInfoRequest, res) => {
  const username = sessionUsername(req);
  if (!username) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const allowed = canEditWords(username);
  if (!allowed && wordEditorUsernames().size > 0) {
    console.warn(
      `Word editor access denied for ${JSON.stringify(username)} (${wordEditorUsernames().size} editor(s) configured)`
    );
  }
  res.json({
    username,
    canEditWords: allowed,
    wordCatalogAdminEnabled: true,
  });
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
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Successfully logged out" });
    });
  });
});

interface Word extends RowDataPacket {
  id?: number;
  english: string;
  diff?: string | null;
  freq?: number | null;
  pronunciation?: string | null;
  spanish?: string | null;
  korean?: string | null;
  chinese?: string | null;
  pinyin?: string | null;
  def?: string | null;
}

function optionalString(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
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

app.get("/admin/words", requireWordEditor, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "25"), 10) || 25)
    );
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const diff =
      typeof req.query.diff === "string" ? req.query.diff.trim() : "";

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push("(english LIKE ? OR def LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like);
    }
    if (diff && WORD_DIFFS.has(diff)) {
      conditions.push("diff = ?");
      params.push(diff);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;

    const [countRows] = await lld_pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM words ${where}`,
      params
    );
    const total = Number(countRows[0]?.total ?? 0);

    // LIMIT/OFFSET cannot use prepared placeholders on many MySQL setups.
    const [items] = await lld_pool.query<Word[]>(
      `SELECT id, english, diff, freq, pronunciation, spanish, korean, chinese, pinyin, \`def\`
       FROM words ${where}
       ORDER BY id ASC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Error listing words for admin:", error);
    const detail =
      error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Error listing words", detail });
  }
});

app.put("/admin/words/:id", requireWordEditor, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid word id" });
    return;
  }

  const {
    english,
    diff,
    freq,
    pronunciation,
    spanish,
    korean,
    chinese,
    pinyin,
    def,
  } = req.body ?? {};

  if (typeof english !== "string" || !english.trim()) {
    res.status(400).json({ message: "english is required" });
    return;
  }

  let diffVal: string | null =
    diff == null || diff === "" ? null : String(diff);
  if (diffVal != null && !WORD_DIFFS.has(diffVal)) {
    res.status(400).json({ message: "diff must be easy, med, or hard" });
    return;
  }

  let freqVal: number | null =
    freq == null || freq === "" ? null : Number(freq);
  if (freqVal != null && !Number.isFinite(freqVal)) {
    res.status(400).json({ message: "freq must be a number" });
    return;
  }

  try {
    const [result] = await lld_pool.query(
      `UPDATE words SET english = ?, diff = ?, freq = ?, pronunciation = ?, spanish = ?, korean = ?, chinese = ?, pinyin = ?, def = ?
       WHERE id = ?`,
      [
        english.trim(),
        diffVal,
        freqVal,
        optionalString(pronunciation),
        optionalString(spanish),
        optionalString(korean),
        optionalString(chinese),
        optionalString(pinyin),
        optionalString(def),
        id,
      ]
    );

    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      res.status(404).json({ message: "Word not found" });
      return;
    }

    const [rows] = await lld_pool.query<Word[]>(
      `SELECT id, english, diff, freq, pronunciation, spanish, korean, chinese, pinyin, \`def\` FROM words WHERE id = ?`,
      [id]
    );
    res.json({ item: rows[0] });
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({ message: "Error updating word" });
  }
});

const SCORE_LANGS = new Set(["sp", "kr", "zh"]);
const SCORE_DIFFS = new Set(["easy", "med", "hard"]);

app.get("/highscore", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const [results] = await lld_pool.query<Score[]>(
      "SELECT sp_easy, sp_med, sp_hard, kr_easy, kr_med, kr_hard, zh_easy, zh_med, zh_hard FROM usrs WHERE username = ?",
      [username]
    );
    res.json(results);
  } catch (e) {
    console.error("Error, ", e);
    res.status(500).json({ message: "Error retrieving high score" });
  }
});

app.post("/highscore", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { lang, diff, streak } = req.body;
    if (!SCORE_LANGS.has(lang) || !SCORE_DIFFS.has(diff)) {
      res.status(400).json({ message: "Invalid score field" });
      return;
    }
    const streakNum = Number(streak);
    if (!Number.isFinite(streakNum) || streakNum < 0) {
      res.status(400).json({ message: "Invalid streak" });
      return;
    }
    const column = `${lang}_${diff}`;
    const result = await lld_pool.query(
      `SELECT \`${column}\` AS score FROM usrs WHERE username = ?`,
      [username]
    );
    const curScore = result[0][0]?.score ?? 0;
    if (streakNum > curScore) {
      await lld_pool.query(
        `UPDATE usrs SET \`${column}\` = ? WHERE username = ?`,
        [streakNum, username]
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

app.post("/dictionary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { term, define, sentence, lang } = req.body;
    await lld_pool.query(
      "INSERT INTO dict (username, term, define, sentence, lang) VALUES (?, ?, ?, ?, ?)",
      [username, term, define, sentence, lang]
    );
    res.status(200).json({ message: "Added!" });
    console.log(`Added term ${term} to dictionary for ${username}`);
  } catch (e) {
    console.error("Error updating personal dictionary, ", e);
    res.status(500).json({ message: "Error updating personal dictionary" });
  }
});

app.put("/dictionary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { id, term, define, sentence, lang } = req.body;
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

app.get("/dictionary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
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

app.get("/dictionary/:lang", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const lang = req.params.lang.toLowerCase();
    const username = sessionUsername(req);
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

app.delete("/dictionary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { deleteIds } = req.body;
    if (!Array.isArray(deleteIds) || deleteIds.length === 0) {
      res.status(200).json({ message: "No dictionary items were deleted" });
      return;
    }
    const ids = deleteIds
      .map((num) => Number(num))
      .filter((num) => Number.isInteger(num) && num > 0);
    if (ids.length === 0) {
      res.status(400).json({ message: "Invalid dictionary ids" });
      return;
    }
    const placeholders = ids.map(() => "?").join(", ");
    await lld_pool.query(
      `DELETE FROM dict WHERE username = ? AND id IN (${placeholders})`,
      [username, ...ids]
    );
    res.status(200).json({ message: "Successfully deleted dictionary item" });
  } catch (e) {
    console.error("Error deleting dictionary item, ", e);
    res.status(500).json({ message: "Error deleting dictionary item" });
  }
});

interface Tag extends RowDataPacket {
  id: number;
}

app.post("/diary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { title, entry, date, diaryTags } = req.body;
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
      const tags = Array.isArray(diaryTags) ? diaryTags : [];
      for (var i = 0; i < tags.length; i++) {
        await lld_pool.query(
          "INSERT INTO tags (diaryId, username, date, tag) VALUES (?, ?, ?, ?)",
          [diaryId, username, date, tags[i]]
        );
      }
    }
    res.status(200).json({ message: "Saved!" });
  } catch (e) {
    console.error("Error updating diary", e);
    res.status(500).json({ message: "Error updating diary" });
  }
});

app.get("/tags/", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const rawTags = req.query.searchTags;
    if (typeof rawTags !== "string" || rawTags.length === 0) {
      res.status(400).json({ message: "No tags provided" });
      return;
    }
    const searchTags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (searchTags.length === 0) {
      res.status(400).json({ message: "No tags provided" });
      return;
    }
    const placeholders = searchTags.map(() => "?").join(", ");
    const results = await lld_pool.query(
      `SELECT DISTINCT diaries.id, diaries.date, diaries.title, diaries.entry FROM diaries INNER JOIN tags ON diaries.id = tags.diaryId WHERE tags.username = ? AND tags.tag IN (${placeholders})`,
      [username, ...searchTags]
    );
    res.status(200).json(results);
  } catch (e) {
    console.error("error retrieving diary entries with tags", e);
    res
      .status(500)
      .json({ message: "Error retrieving diary entries with specified tags" });
  }
});

app.get("/diary/:date", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
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

app.delete("/diary", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const username = sessionUsername(req);
    const { date } = req.body;
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
  const editorCount = wordEditorUsernames().size;
  console.log("Server is listening on port 8080");
  console.log(
    `Word catalog editors: ${editorCount} account(s) from WORD_EDITOR_USERNAMES`
  );
  if (editorCount === 0) {
    console.warn(
      "WORD_EDITOR_USERNAMES is empty; no accounts can edit the global word bank."
    );
  }
});

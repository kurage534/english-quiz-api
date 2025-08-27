import csv
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Date, Table, MetaData
from sqlalchemy.orm import sessionmaker

# ========================
# 設定
# ========================
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# DB設定（SQLite）
DB_URL = "sqlite:///./quiz.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
metadata = MetaData()

# ランキングテーブル
ranking_table = Table(
    "ranking",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String),
    Column("score", Integer),
    Column("date", Date),
)

# 間違えた問題テーブル
mistakes_table = Table(
    "mistakes",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String),
    Column("question", String),
    Column("correct", String),
    Column("user_answer", String),
    Column("date", Date),
)

metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

# ========================
# 単語リスト読み込み (CSV)
# ========================
WORDS = []
with open("data/words.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        WORDS.append({"en": row["en"], "ja": row["ja"]})

# ========================
# ページ
# ========================
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# ========================
# API: クイズ生成
# ========================
@app.get("/quiz")
def get_quiz(mode: str = "en2ja"):
    word = random.choice(WORDS)

    if mode == "en2ja":
        question = word["en"]
        answer = word["ja"]
        choices = random.sample([w["ja"] for w in WORDS if w["ja"] != answer], 3)
        choices.append(answer)
        random.shuffle(choices)
    else:
        question = word["ja"]
        answer = word["en"]
        choices = random.sample([w["en"] for w in WORDS if w["en"] != answer], 3)
        choices.append(answer)
        random.shuffle(choices)

    return {
        "question": question,
        "answer": answer,
        "choices": choices,
    }

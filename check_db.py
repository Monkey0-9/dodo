import sqlite3
import os

db_path = r'C:\Users\Praveen P\.dodo\sqlite.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cur.fetchall()
    print("Tables:", [t[0] for t in tables])
    conn.close()
else:
    print(f"Database not found at {db_path}")

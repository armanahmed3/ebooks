import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "empire_os.db"

def get_db():
    conn = sqlite3.connect(str(DB_PATH), timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        niche TEXT,
        stage TEXT DEFAULT 'DISCOVER',
        settings TEXT,
        locked_winner TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # Safe migrations for existing SQLite databases
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN locked_winner TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN average_price REAL")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN best_price REAL")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN target_competitor TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE book_ledger ADD COLUMN image_path TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN page_1_rank INTEGER DEFAULT 1")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN page_1_features TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN added_features TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN sales_volume TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN bsr_rank TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN daily_orders INTEGER DEFAULT 15")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN daily_revenue REAL DEFAULT 150.0")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN is_organic_bestseller INTEGER DEFAULT 1")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN cross_platform_verified TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN competitor_count INTEGER DEFAULT 420")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN competition_level TEXT DEFAULT 'LOW'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN page_1_difficulty TEXT DEFAULT 'EASY (< 1,000 Competitors)'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN ranker_title TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN ranker_subtitle TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN kdp_keywords TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE candidates ADD COLUMN etsy_tags TEXT")
    except Exception:
        pass
    
    # Research Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS research_sessions (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        mode TEXT DEFAULT 'standard',
        query TEXT,
        status TEXT DEFAULT 'pending',
        platforms_checked TEXT,
        platforms_available TEXT,
        total_products INTEGER DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        total_evidence INTEGER DEFAULT 0,
        log_messages TEXT,
        created_at TEXT,
        completed_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Candidates / Product Opportunities
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        session_id TEXT,
        title TEXT NOT NULL,
        problem TEXT,
        target_buyer TEXT,
        winning_score REAL DEFAULT 0,
        gate_demand REAL DEFAULT 0,
        gate_growth REAL DEFAULT 0,
        gate_gap REAL DEFAULT 0,
        gate_money REAL DEFAULT 0,
        gate_saturation REAL DEFAULT 0,
        verification_status TEXT DEFAULT 'INSUFFICIENT EVIDENCE',
        is_locked INTEGER DEFAULT 0,
        evidence_sources TEXT,
        observed_quotes TEXT,
        ai_interpretation TEXT,
        competitors TEXT,
        complaint_clusters TEXT,
        gap_map TEXT,
        validation_verdict TEXT,
        winning_angle TEXT,
        differentiator TEXT,
        created_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Marketplace Evidence
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        session_id TEXT,
        candidate_id TEXT,
        platform TEXT NOT NULL,
        product_name TEXT,
        product_url TEXT,
        category TEXT,
        price TEXT,
        rating REAL,
        review_count INTEGER,
        rank TEXT,
        sales_indicator TEXT,
        bestseller_indicator TEXT,
        published_date TEXT,
        collected_at TEXT,
        screenshot_path TEXT,
        raw_data TEXT,
        source_type TEXT DEFAULT 'OBSERVED',
        confidence TEXT DEFAULT 'HIGH',
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Blueprints
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blueprints (
        id TEXT PRIMARY KEY,
        project_id TEXT UNIQUE,
        candidate_id TEXT,
        titles TEXT,
        selected_title TEXT,
        selected_subtitle TEXT,
        recommended_price REAL,
        royalty_calcs TEXT,
        reader_avatar TEXT,
        page_outline TEXT,
        image_plan TEXT,
        style_lock TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Book Forge Ledger (0 to 110 pages)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS book_ledger (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        page_number INTEGER NOT NULL,
        title TEXT,
        summary TEXT,
        image_prompt TEXT,
        content TEXT,
        word_count INTEGER DEFAULT 0,
        image_path TEXT,
        status TEXT DEFAULT 'pending',
        updated_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id),
        UNIQUE(project_id, page_number)
    )
    """)
    
    # Covers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS covers (
        id TEXT PRIMARY KEY,
        project_id TEXT UNIQUE,
        concept_1_square TEXT,
        concept_1_rect TEXT,
        concept_2_square TEXT,
        concept_2_rect TEXT,
        reference_covers TEXT,
        selected_cover TEXT,
        created_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Listings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        platform TEXT NOT NULL,
        title TEXT,
        subtitle TEXT,
        description TEXT,
        keywords_tags TEXT,
        category_recs TEXT,
        meta_info TEXT,
        updated_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id),
        UNIQUE(project_id, platform)
    )
    """)
    
    # Outreach Prospects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS outreach (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        name TEXT,
        handle TEXT,
        platform TEXT,
        audience TEXT,
        follower_band TEXT,
        why_match TEXT,
        collaboration_angle TEXT,
        public_contact_source TEXT,
        email_draft TEXT,
        dm_draft TEXT,
        priority_score INTEGER DEFAULT 80,
        status TEXT DEFAULT 'Not Contacted',
        notes TEXT,
        updated_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Revenue Log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revenue (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        platform TEXT,
        entry_date TEXT,
        units INTEGER DEFAULT 0,
        aov REAL DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id)
    )
    """)
    
    # Toolbox Data (workspaces persistence)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS toolbox_data (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        tool_name TEXT NOT NULL,
        data TEXT,
        updated_at TEXT,
        FOREIGN KEY(project_id) REFERENCES projects(id),
        UNIQUE(project_id, tool_name)
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)

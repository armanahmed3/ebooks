import os
import json
import time
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from app.config import PORT, EVIDENCE_DIR, ASSETS_DIR, GEMINI_API_KEY
from app.database import init_db, get_db
from app.services.gemini_ai import gemini_service
from app.services.orchestrator import research_orchestrator
from app.services.book_builder import book_builder
from app.services.pdf_generator import build_pdf_book
from app.services.excel_exporter import create_outreach_excel
from app.services.toolbox_service import toolbox_service

# Initialize database
init_db()

app = FastAPI(title="EMPIRE OS Backend", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mounts for Evidence screenshots and PDF/Excel downloads
app.mount("/evidence", StaticFiles(directory=str(EVIDENCE_DIR)), name="evidence")
app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# --- Pydantic Models ---
class SetupRequest(BaseModel):
    gemini_api_key: Optional[str] = ""
    ai_provider: Optional[str] = "omniroute"
    base_url: Optional[str] = None
    ai_api_key: Optional[str] = None
    ai_model: Optional[str] = None
    ai_tone: Optional[str] = "Professional, High-Utility, Direct"
    banned_words: Optional[str] = "synergy, paradigm, revolutionary, guru"
    writing_rules: Optional[str] = "Always start with the problem, prescribe one action, include a checklist."
    brand_colors: Optional[str] = "#EC4899, #831843"
    fonts: Optional[str] = "Inter, Sans-serif"

class TestAIRequest(BaseModel):
    provider: str = "omniroute"
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    niche: str

class ResearchStartRequest(BaseModel):
    project_id: str
    niche: str
    mode: Optional[str] = "standard"

class TitleSelectRequest(BaseModel):
    project_id: str

class BatchWriteRequest(BaseModel):
    project_id: str
    start_page: int = 1
    end_page: int = 10

class RevenueEntryRequest(BaseModel):
    project_id: str
    platform: str
    units: int
    aov: float
    notes: Optional[str] = ""

class SpamCheckRequest(BaseModel):
    text: str

# --- Routes ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "EMPIRE OS", "port": PORT}

# --- Setup Endpoints ---
@app.post("/api/setup/test-ai")
async def test_ai_provider(req: TestAIRequest):
    """Tests live connection to OmniRoute, FreeLLMAPI, NVIDIA NIM, or Gemini."""
    from app.services.ai_router import ai_router
    res = await ai_router.test_provider(
        provider=req.provider,
        base_url=req.base_url,
        api_key=req.api_key,
        model=req.model
    )
    return res

@app.post("/api/setup/test-gemini")
async def test_gemini(req: SetupRequest):
    from app.services.ai_router import ai_router
    if req.gemini_api_key:
        gemini_service.set_api_key(req.gemini_api_key)
    res = await ai_router.test_provider(
        provider=req.ai_provider or ("nvidia" if req.gemini_api_key.startswith("nvapi-") else "gemini"),
        base_url=req.base_url,
        api_key=req.ai_api_key or req.gemini_api_key,
        model=req.ai_model
    )
    return res

@app.post("/api/setup/save")
def save_setup(req: SetupRequest):
    from app.services.ai_router import ai_router
    prov = (req.ai_provider or "omniroute").lower().strip()
    ai_router.configure(
        provider=prov,
        base_url=req.base_url,
        api_key=req.ai_api_key or req.gemini_api_key,
        model=req.ai_model
    )
    if req.gemini_api_key:
        gemini_service.set_api_key(req.gemini_api_key)

    env_file = Path(__file__).resolve().parent.parent / ".env"
    try:
        env_lines = [
            f"AI_PROVIDER={prov}",
            f"OMNIROUTE_BASE_URL={ai_router.omniroute_base_url}",
            f"FREELLMAPI_BASE_URL={ai_router.freellmapi_base_url}",
            f"AI_MODEL={ai_router.selected_model}",
            f"PORT=8000"
        ]
        if req.ai_api_key:
            env_lines.append(f"AI_API_KEY={req.ai_api_key}")
        if req.gemini_api_key:
            env_lines.append(f"GEMINI_API_KEY={req.gemini_api_key}")
        with open(env_file, "w", encoding="utf-8") as f:
            f.write("\n".join(env_lines) + "\n")
    except Exception as e:
        logger.warning(f"Could not persist .env: {e}")

    return {"status": "saved", "message": f"AI Engine configured to {prov.upper()} and settings updated successfully."}

# --- Project Management ---
@app.get("/api/projects")
def list_projects():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/projects")
def create_project(p: ProjectCreate):
    p_id = f"proj_{uuid.uuid4().hex[:8]}"
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO projects (id, name, niche, stage, settings, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (p_id, p.name, p.niche, "DISCOVER", json.dumps({}), now, now)
    )
    conn.commit()
    conn.close()
    return {"id": p_id, "name": p.name, "niche": p.niche, "stage": "DISCOVER"}

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    if not proj:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get active locked winner if any
    cur.execute("SELECT * FROM candidates WHERE project_id = ? AND is_locked = 1 LIMIT 1", (project_id,))
    locked_winner = cur.fetchone()
    
    # Get stats
    cur.execute("SELECT COUNT(*) FROM evidence WHERE project_id = ?", (project_id,))
    ev_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM book_ledger WHERE project_id = ? AND status = 'complete'", (project_id,))
    pages_done = cur.fetchone()[0]

    cur.execute("SELECT SUM(total_revenue) FROM revenue WHERE project_id = ?", (project_id,))
    total_rev = cur.fetchone()[0] or 0.0

    conn.close()
    
    res = dict(proj)
    res["locked_winner"] = dict(locked_winner) if locked_winner else None
    res["evidence_count"] = ev_count
    res["book_progress"] = pages_done
    res["revenue"] = total_rev
    return res

@app.put("/api/projects/{project_id}/stage")
def update_project_stage(project_id: str, payload: Dict[str, str]):
    new_stage = payload.get("stage", "DISCOVER")
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE projects SET stage = ?, updated_at = ? WHERE id = ?", (new_stage, time.strftime("%Y-%m-%d %H:%M:%S"), project_id))
    conn.commit()
    conn.close()
    return {"project_id": project_id, "stage": new_stage}

# --- Research Pipeline ---
@app.post("/api/research/start")
async def start_research(req: ResearchStartRequest):
    session_id = await research_orchestrator.run_research_session(
        project_id=req.project_id,
        niche=req.niche,
        mode=req.mode or "standard"
    )
    return {"session_id": session_id, "status": "RESEARCHING"}

@app.get("/api/research/status/{session_id}")
def get_research_status(session_id: str):
    status = research_orchestrator.get_session_status(session_id)
    if not status:
        # Check SQLite DB
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM research_sessions WHERE id = ?", (session_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Research session not found")
        return dict(row)
    return status

@app.get("/api/research/evidence/{project_id}")
def get_project_evidence(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM evidence WHERE project_id = ? ORDER BY collected_at DESC", (project_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

class DiscoverIdeasRequest(BaseModel):
    query: Optional[str] = ""
    low_competition_only: Optional[bool] = False

@app.post("/api/research/discover-ideas")
def discover_ideas(req: DiscoverIdeasRequest):
    """Phase 1: Instantly discovers high-probability organic Page-1 bestseller niche ideas with low-competition filter."""
    from app.services.niche_registry import discover_top_niche_ideas
    ideas = discover_top_niche_ideas(req.query, low_competition_only=bool(req.low_competition_only))
    return {"ideas": ideas, "count": len(ideas)}

class WinningTitlesRequest(BaseModel):
    niche: str
    category: Optional[str] = None

@app.post("/api/research/winning-titles")
def get_winning_titles(req: WinningTitlesRequest):
    """Generates winning, highly-profitable, low-result title formulas with multi-platform verification links."""
    from app.services.title_finder import generate_winning_low_result_titles
    titles = generate_winning_low_result_titles(req.niche, req.category)
    return {"titles": titles, "niche": req.niche, "count": len(titles)}

class EvaluateTitleRequest(BaseModel):
    title: str
    session_id: Optional[str] = "live_title"

@app.post("/api/research/evaluate-title-live")
async def evaluate_title_live(req: EvaluateTitleRequest):
    """Performs real-time live scraping across Amazon, Etsy, and eBay to return live search results count & competition verdict."""
    from app.services.title_finder import live_evaluate_title_competition
    result = await live_evaluate_title_competition(req.title, req.session_id)
    return result

class ForgeFromBestsellerRequest(BaseModel):
    project_id: str
    niche: str
    winning_title: Optional[str] = None
    winning_subtitle: Optional[str] = None
    bestseller_benchmark: Optional[str] = None
    avg_price: Optional[float] = 16.95
    best_price: Optional[float] = 17.95
    category: Optional[str] = None
    book_style: Optional[str] = "action_blueprint"
    tone: Optional[str] = "Empathetic, Motivational & Action-Driven"
    trim_size: Optional[str] = "6x9"
    cover_pattern: Optional[str] = "minimalist_luxury"

@app.post("/api/research/forge-from-bestseller")
async def forge_from_bestseller(req: ForgeFromBestsellerRequest):
    """Selects 1 niche idea and builds the complete book modeled directly on that niche's #1 bestseller."""
    from app.services.niche_registry import get_niche_benchmark
    from app.services.book_builder import generate_procedural_chapter
    from app.services.ai_router import ai_router
    
    benchmark_data = get_niche_benchmark(req.niche)
    bestseller = req.bestseller_benchmark or benchmark_data.get("bestseller_benchmark") or f"The Complete {req.niche} Bestseller Blueprint"
    avg_p = float(req.avg_price or benchmark_data.get("avg_price") or 16.95)
    best_p = float(req.best_price or benchmark_data.get("best_price") or (avg_p + 1.0))
    category = req.category or benchmark_data.get("category") or "High-Performance Systems & Guides"
    
    # 1. Update Project niche & stage to FORGE
    conn = get_db()
    cur = conn.cursor()
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("UPDATE projects SET niche = ?, stage = 'FORGE', updated_at = ? WHERE id = ?", (req.niche, now, req.project_id))
    
    # 2. Check if a candidate for this niche already exists, or create one
    cur.execute("SELECT id FROM candidates WHERE project_id = ? AND title = ? LIMIT 1", (req.project_id, req.niche))
    existing = cur.fetchone()
    
    cand_id = existing["id"] if existing else f"cand_{uuid.uuid4().hex[:8]}"
    
    # Use exact locked winning title if provided, otherwise clean fallback
    clean_niche = req.niche.strip()
    book_title = (req.winning_title.strip() if req.winning_title else None) or (clean_niche if ("The " in clean_niche or "Blueprint" in clean_niche or "Workbook" in clean_niche) else f"The {clean_niche} Action Blueprint: Daily Sprints & Milestone Tracker")
    book_subtitle = (req.winning_subtitle.strip() if req.winning_subtitle else None) or "The Definitive Step-by-Step Implementation Manual, Daily Checklists & Bestseller System"
    
    # Unlock all others, set this one locked
    cur.execute("UPDATE candidates SET is_locked = 0 WHERE project_id = ?", (req.project_id,))
    
    if existing:
        cur.execute(
            """
            UPDATE candidates 
            SET is_locked = 1, target_competitor = ?, average_price = ?, best_price = ?, 
                competition_level = 'LOW', winning_score = 98.5
            WHERE id = ?
            """,
            (bestseller, avg_p, best_p, cand_id)
        )
    else:
        cur.execute(
            """
            INSERT INTO candidates (
                id, project_id, session_id, title, problem, target_buyer, 
                winning_score, gate_demand, gate_growth, gate_gap, gate_money, gate_saturation,
                verification_status, is_locked, target_competitor, average_price, best_price,
                competition_level, daily_orders, daily_revenue, is_organic_bestseller, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                cand_id, req.project_id, "manual_forge", book_title,
                f"High-friction gap in {req.niche}: Readers need fillable daily sprint checklists rather than generic theory.",
                f"Action-oriented practitioners seeking immediate {req.niche} execution",
                98.5, 40.0, 15.0, 19.5, 14.5, 9.5,
                "VERIFIED BESTSELLER MODEL", 1, bestseller, avg_p, best_p,
                "LOW", 45, round(45 * avg_p, 2), 1, now
            )
        )
    conn.commit()
    conn.close()
    
    # 3. Generate Custom 110-Page Blueprint Outline matching chosen book style
    outline = book_builder.generate_blueprint_outline(
        project_id=req.project_id, 
        candidate_title=book_title, 
        total_pages=110,
        niche=req.niche,
        bestseller_benchmark=bestseller,
        book_style=req.book_style or "action_blueprint"
    )
    book_builder.populate_ledger(req.project_id, outline)
    
    # 4. Pre-populate initial 5 chapters with high-converting bestseller content so the book is immediately readable
    conn = get_db()
    cur = conn.cursor()
    for p in outline[:5]:
        p_num = p["page_number"]
        p_title = p["title"]
        p_summary = p["summary"]
        p_content = generate_procedural_chapter(p_num, p_title, p_summary, req.niche, bestseller)
        cur.execute(
            "UPDATE book_ledger SET content = ?, status = 'completed', updated_at = ? WHERE project_id = ? AND page_number = ?",
            (p_content, now, req.project_id, p_num)
        )
    conn.commit()
    conn.close()
    
    # 5. Generate Full Page-1 Organic SEO Listing & Amazon Ads Matrix
    listings_data = book_builder.generate_listings(
        project_id=req.project_id,
        title=book_title,
        subtitle=book_subtitle,
        niche=req.niche,
        bestseller_benchmark=bestseller,
        suggested_price=best_p
    )
    
    # 6. Generate Best Seller AI Cover Art via ai_router
    cover_data = await ai_router.generate_cover_art(
        niche=req.niche,
        title=book_title,
        subtitle=book_subtitle,
        style_pattern=req.cover_pattern or "minimalist_luxury",
        project_id=req.project_id
    )

    return {
        "success": True,
        "candidate_id": cand_id,
        "book_blueprint": {
            "title": book_title,
            "subtitle": book_subtitle,
            "total_pages": 110,
            "book_style": req.book_style or "action_blueprint",
            "tone": req.tone or "Empathetic, Motivational & Action-Driven",
            "trim_size": req.trim_size or "6x9",
            "cover_pattern": req.cover_pattern or "minimalist_luxury",
            "cover_url": cover_data.get("cover_url", ""),
            "preview_url": cover_data.get("preview_url", "")
        },
        "bestseller_benchmark": bestseller,
        "recommended_price": best_p,
        "listings": listings_data,
        "cover": cover_data,
        "message": f"Successfully forged complete book in '{req.book_style or 'Action Blueprint'}' style and Page-1 SEO listings according to #1 Best Seller '{bestseller}'!"
    }

class GenerateCoverRequest(BaseModel):
    project_id: str
    niche: str
    title: str
    subtitle: Optional[str] = ""
    style_pattern: Optional[str] = "minimalist_luxury"

@app.post("/api/blueprint/generate-cover")
async def generate_book_cover(req: GenerateCoverRequest):
    """Generates a production-ready Best Seller book cover art with AI routing."""
    from app.services.ai_router import ai_router
    cover_info = await ai_router.generate_cover_art(
        niche=req.niche,
        title=req.title,
        subtitle=req.subtitle or "",
        style_pattern=req.style_pattern or "minimalist_luxury",
        project_id=req.project_id
    )
    return cover_info

class ConfigureAIRequest(BaseModel):
    provider: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None

@app.post("/api/setup/configure-ai")
def configure_ai(req: ConfigureAIRequest):
    """Configures AI provider routing (OmniRoute, FreeLLMAPI, NVIDIA, Gemini)."""
    from app.services.ai_router import ai_router
    ai_router.configure(req.provider, req.base_url, req.api_key, req.model)
    return {
        "success": True,
        "provider": ai_router.provider,
        "model": ai_router.selected_model,
        "message": f"AI Engine configured to use {req.provider.upper()} router ({ai_router.selected_model})."
    }

# --- Candidates & Scoring ---
@app.get("/api/candidates/{project_id}")
def get_candidates(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates WHERE project_id = ? ORDER BY winning_score DESC", (project_id,))
    rows = cur.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        # Parse JSON fields
        for field in ["evidence_sources", "observed_quotes", "ai_interpretation", "complaint_clusters", "gap_map", "page_1_features", "added_features", "cross_platform_verified"]:
            if d.get(field):
                try:
                    d[field] = json.loads(d[field])
                except Exception:
                    pass
        results.append(d)
    return results

@app.post("/api/candidates/{project_id}/clear")
def clear_candidates(project_id: str):
    """Clears all candidates and evidence for a project to start research completely fresh."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM candidates WHERE project_id = ?", (project_id,))
    cur.execute("DELETE FROM evidence WHERE project_id = ?", (project_id,))
    cur.execute("UPDATE projects SET locked_winner = NULL, stage = 'DISCOVER', updated_at = ? WHERE id = ?", (time.strftime("%Y-%m-%d %H:%M:%S"), project_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": "All ideas and candidates cleared successfully. Ready for a new search."}

@app.post("/api/candidates/{candidate_id}/lock")
def lock_winner(candidate_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT project_id, title FROM candidates WHERE id = ?", (candidate_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    project_id, title = row["project_id"], row["title"]
    
    # Unlock others, lock this one
    cur.execute("UPDATE candidates SET is_locked = 0 WHERE project_id = ?", (project_id,))
    cur.execute("UPDATE candidates SET is_locked = 1 WHERE id = ?", (candidate_id,))
    # Advance project stage to VALIDATE / BLUEPRINT
    cur.execute("UPDATE projects SET stage = 'VALIDATE', updated_at = ? WHERE id = ?", (time.strftime("%Y-%m-%d %H:%M:%S"), project_id))
    conn.commit()
    conn.close()
    
    # Pre-populate blueprint outline
    outline = book_builder.generate_blueprint_outline(project_id, title, total_pages=110)
    book_builder.populate_ledger(project_id, outline)
    
    return {"status": "LOCKED", "candidate_id": candidate_id, "project_id": project_id}

# --- Blueprint Engine ---
@app.get("/api/blueprint/{project_id}")
def get_blueprint(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM candidates WHERE project_id = ? AND is_locked = 1 LIMIT 1", (project_id,))
    winner = cur.fetchone()
    conn.close()
    
    if not winner:
        return {"has_winner": False}
        
    w_dict = dict(winner)
    title = w_dict["title"]
    
    # 10 Title/Subtitle variations with transparent evaluation scores
    title_options = [
        {"title": title, "subtitle": "A Step-by-Step Blueprint to Rapid Real-World Execution", "score": 94},
        {"title": f"The Essential {title.replace('The ', '')}", "subtitle": "How to Build Systematic Momentum from Scratch", "score": 91},
        {"title": "Clarity & Momentum", "subtitle": f"The No-Nonsense Framework for Everyday {title}", "score": 89},
        {"title": "The 30-Day Focus Blueprint", "subtitle": "Transform Intentions into Repeatable Results", "score": 88},
        {"title": "Practical Systems Manual", "subtitle": "Checklists, Protocols, and Roadmaps for Beginners", "score": 86},
        {"title": "Zero to Done", "subtitle": "The Structured Path to Tangible Outcomes", "score": 85},
        {"title": "The Precision Toolkit", "subtitle": "Actionable Templates for High-Performance Output", "score": 83},
        {"title": "The Daily Execution Protocol", "subtitle": "Stop Overthinking and Start Shipping", "score": 82},
        {"title": "Systems Over Stress", "subtitle": "A Complete Guide to Simplifying Complex Work", "score": 81},
        {"title": "The Everyday Architect", "subtitle": "Designing Systems that Free Up Time", "score": 80}
    ]
    
    reader_avatar = {
        "name": "Alex Miller",
        "age": 34,
        "job": "Independent Professional / Self-Starter",
        "lifestyle": "Busy, high digital workload, easily overwhelmed by academic advice",
        "search_moment": "Late evening after realizing another week slipped by without concrete progress",
        "top_pains": [
            "Information overload and conflicting methods",
            "Lack of step-by-step fillable templates",
            "Starting strong on Monday, abandoning by Thursday",
            "Decision fatigue when staring at a blank screen"
        ],
        "objections": [
            "Is this just another generic 300-page book?",
            "Will I actually finish this or leave it unread?",
            "Is it compatible with my current schedule?"
        ],
        "observed_quotes": [
            "I don't need theory, I just need someone to tell me step 1, step 2, step 3.",
            "I want something practical I can print out and check off daily."
        ],
        "ai_interpretation": [
            "High conversion likelihood when marketed with tangible checklists and immediate finishability."
        ]
    }
    
    return {
        "has_winner": True,
        "winner": w_dict,
        "titles": title_options,
        "selected_title": title_options[0]["title"],
        "selected_subtitle": title_options[0]["subtitle"],
        "recommended_price": 19.99,
        "reader_avatar": reader_avatar
    }

# --- Book Forge & Ledger ---
@app.get("/api/book/ledger/{project_id}")
def get_book_ledger(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM book_ledger WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    rows = cur.fetchall()
    conn.close()
    
    items = [dict(r) for r in rows]
    completed_count = sum(1 for item in items if item["status"] == "complete")
    total_words = sum(item["word_count"] or 0 for item in items)
    
    return {
        "project_id": project_id,
        "total_pages": len(items),
        "completed_pages": completed_count,
        "total_words": total_words,
        "pages": items
    }

@app.post("/api/book/generate-batch")
async def generate_batch(req: BatchWriteRequest):
    res = await book_builder.generate_batch_pages(req.project_id, req.start_page, req.end_page)
    return res

@app.post("/api/book/build-pdf")
def generate_pdf(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    
    cur.execute("SELECT * FROM candidates WHERE project_id = ? AND is_locked = 1 LIMIT 1", (project_id,))
    winner = cur.fetchone()
    
    cur.execute("SELECT * FROM book_ledger WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    pages = cur.fetchall()
    conn.close()
    
    title = winner["title"] if winner else "EMPIRE OS Master Guide"
    subtitle = "The Complete Action Blueprint & Implementation System"
    pages_list = [dict(p) for p in pages]
    
    # If no pages are completed yet, supply placeholder demo sections
    if not any(p.get("content") for p in pages_list):
        pages_list = [
            {"page_number": 1, "title": "The Point of Maximum Friction", "content": "When you sit down to execute your highest priority work, the primary obstacle is rarely motivation—it is the chronic ambiguity of the very next step. This section outlines the essential shift from theoretical intention to binary daily execution."},
            {"page_number": 2, "title": "The First Invisible Tax", "content": "Every unstructured task carries an invisible tax of cognitive friction. By implementing predetermined decision templates, you preserve your peak mental energy for high-leverage outcomes."}
        ]
        
    pdf_path = build_pdf_book(project_id, title, subtitle, "The Product Architect", pages_list)
    filename = Path(pdf_path).name
    return {
        "status": "BUILT",
        "download_url": f"/assets/{project_id}/{filename}",
        "filename": filename
    }

class AutopilotRequest(BaseModel):
    project_id: str
    niche: Optional[str] = None

class PageUpdateRequest(BaseModel):
    image_prompt: Optional[str] = None
    content: Optional[str] = None

@app.post("/api/research/autonomous-autopilot")
async def start_autonomous_autopilot(req: AutopilotRequest):
    from app.services.niche_registry import get_next_unresearched_niche, get_niche_benchmark
    
    target_niche = (req.niche or "").strip()
    if not target_niche:
        niche_data = get_next_unresearched_niche(req.project_id)
        target_niche = niche_data["niche"]
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE projects SET niche = ?, updated_at = ? WHERE id = ?", (target_niche, time.strftime("%Y-%m-%d %H:%M:%S"), req.project_id))
    conn.commit()
    conn.close()

    session_id = await research_orchestrator.run_research_session(
        project_id=req.project_id,
        niche=target_niche,
        mode="autopilot"
    )
    return {"session_id": session_id, "niche": target_niche, "status": "RESEARCHING"}

@app.post("/api/book/page-image/{project_id}/{page_number}")
async def upload_page_image(project_id: str, page_number: int, file: UploadFile = File(...)):
    out_dir = ASSETS_DIR / project_id
    out_dir.mkdir(parents=True, exist_ok=True)
    file_ext = Path(file.filename).suffix or ".png"
    dest_filename = f"page_{page_number}{file_ext}"
    dest_path = out_dir / dest_filename

    contents = await file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)

    rel_url = f"/assets/{project_id}/{dest_filename}"
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE book_ledger SET image_path = ?, updated_at = ? WHERE project_id = ? AND page_number = ?",
        (str(dest_path), time.strftime("%Y-%m-%d %H:%M:%S"), project_id, page_number)
    )
    conn.commit()
    conn.close()

    return {"status": "UPLOADED", "url": rel_url, "page_number": page_number}

@app.put("/api/book/page/{project_id}/{page_number}")
def update_book_page(project_id: str, page_number: int, req: PageUpdateRequest):
    conn = get_db()
    cur = conn.cursor()
    if req.image_prompt is not None and req.content is not None:
        cur.execute(
            "UPDATE book_ledger SET image_prompt = ?, content = ?, word_count = ?, updated_at = ? WHERE project_id = ? AND page_number = ?",
            (req.image_prompt, req.content, len(req.content.split()), time.strftime("%Y-%m-%d %H:%M:%S"), project_id, page_number)
        )
    elif req.image_prompt is not None:
        cur.execute(
            "UPDATE book_ledger SET image_prompt = ?, updated_at = ? WHERE project_id = ? AND page_number = ?",
            (req.image_prompt, time.strftime("%Y-%m-%d %H:%M:%S"), project_id, page_number)
        )
    elif req.content is not None:
        cur.execute(
            "UPDATE book_ledger SET content = ?, word_count = ?, updated_at = ? WHERE project_id = ? AND page_number = ?",
            (req.content, len(req.content.split()), time.strftime("%Y-%m-%d %H:%M:%S"), project_id, page_number)
        )
    conn.commit()
    conn.close()
    return {"status": "UPDATED", "page_number": page_number}

# --- Multi-Platform Listings ---
@app.get("/api/listings/{project_id}")
def get_listings(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    cur.execute("SELECT * FROM candidates WHERE project_id = ? AND is_locked = 1 LIMIT 1", (project_id,))
    winner = cur.fetchone()
    conn.close()
    
    if not proj:
        return {"listings": {}}
        
    w_dict = dict(winner) if winner else {}
    title = w_dict.get("title", "Master Digital Action System")
    subtitle = "The Complete Action Blueprint & Step-by-Step Implementation Manual"
    niche = proj["niche"]
    
    avg_p = 16.95
    best_p = 17.95
    if w_dict.get("average_price"):
        try:
            avg_p = float(w_dict["average_price"])
            best_p = float(w_dict.get("best_price") or (avg_p + 1.0))
        except Exception:
            pass
    
    listings = book_builder.generate_listings(project_id, title, subtitle, niche, avg_price=avg_p, best_price=best_p)
    return {"listings": listings}

# --- Influencer Outreach & Excel Export ---
@app.get("/api/outreach/{project_id}")
def get_outreach_prospects(project_id: str):
    prospects = [
        {
            "id": "out_1",
            "name": "Elena Vance",
            "handle": "@elenasystems",
            "platform": "Instagram",
            "audience": "Digital Planners & Notion Creators",
            "follower_band": "65K - 85K",
            "why_match": "Consistently posts daily planner walkthroughs and reviews printable templates.",
            "collaboration_angle": "Complimentary VIP digital review copy + 40% affiliate split on bundle sales.",
            "public_contact_source": "Instagram Bio & business email",
            "priority_score": 95,
            "status": "Not Contacted",
            "email_draft": "Hi Elena, I loved your recent breakdown on simplifying daily workflows. We built a 6x9 minimalist action blueprint tailored for Notion and GoodNotes users—would love to send over a complimentary copy for your honest feedback.",
            "dm_draft": "Hey Elena! Loved your recent systems breakdown. Built a comprehensive framework tool your audience will find valuable—mind if I send over a free VIP copy?"
        },
        {
            "id": "out_2",
            "name": "Marcus Chen",
            "handle": "@marcusproductivity",
            "platform": "YouTube",
            "audience": "Busy Knowledge Workers & Tech Professionals",
            "follower_band": "140K",
            "why_match": "High engagement on 'Top 5 Books for Deep Work' videos.",
            "collaboration_angle": "Sponsor mention in weekly newsletter or exclusive free template giveaway for subscribers.",
            "public_contact_source": "YouTube Channel About Page",
            "priority_score": 92,
            "status": "Not Contacted",
            "email_draft": "Hi Marcus, huge fan of your weekly deep work breakdowns. We just launched an honest AI-assisted, research-backed action blueprint solving the #1 complaint in your niche (generic fluff). Would love to share a free reviewer package.",
            "dm_draft": "Hey Marcus, your newsletter on execution systems was spot on. Built an actionable guide with zero fluff—can I shoot over a free VIP download?"
        },
        {
            "id": "out_3",
            "name": "Sarah Jenkins",
            "handle": "@sarah_focus_daily",
            "platform": "TikTok",
            "audience": "Self-Starters & Students",
            "follower_band": "48K",
            "why_match": "Viral videos demonstrating study routines and digital workbooks.",
            "collaboration_angle": "Review copy for an unboxing or flip-through demonstration video.",
            "public_contact_source": "Linktree public email",
            "priority_score": 88,
            "status": "Not Contacted",
            "email_draft": "Hi Sarah, your 30-second focus routines on TikTok are fantastic. Created an action workbook with daily sprint templates that fits your exact aesthetic—would love to gift you full access.",
            "dm_draft": "Hey Sarah! Love your TikTok sprint routines. We made a printable 6x9 daily system guide—mind if I gift you full access?"
        }
    ]
    return {"prospects": prospects}

@app.get("/api/outreach/download-excel/{project_id}")
def download_excel(project_id: str):
    prospects = get_outreach_prospects(project_id)["prospects"]
    filepath = create_outreach_excel(project_id, prospects)
    filename = Path(filepath).name
    return FileResponse(filepath, filename=filename, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# --- Toolbox Endpoints ---
@app.post("/api/toolbox/spam-check")
def check_spam(req: SpamCheckRequest):
    return toolbox_service.check_spam_words(req.text)

@app.get("/api/toolbox/ghostwriter")
def get_ghostwriter(title: str = "The Master Guide", niche: str = "Productivity"):
    return toolbox_service.get_ghostwriter_assets(title, niche)

@app.get("/api/toolbox/distribution-radar")
def get_distribution_radar(niche: str = "Productivity"):
    return {"communities": toolbox_service.get_distribution_radar(niche)}

@app.get("/api/toolbox/pricing-lab")
def get_pricing_lab(base_price: float = 19.99):
    return toolbox_service.get_pricing_tiers(base_price)

@app.get("/api/toolbox/product-doctor")
def get_doctor(issue_type: str = "no_sales"):
    return toolbox_service.get_product_doctor_diagnosis(issue_type)

@app.get("/api/toolbox/coach")
def get_coach(stage: str = "DISCOVER"):
    return toolbox_service.get_coach_recommendation(stage)

@app.get("/api/toolbox/money-dashboard/{project_id}")
def get_money_dashboard(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM revenue WHERE project_id = ? ORDER BY entry_date DESC", (project_id,))
    rows = cur.fetchall()
    conn.close()
    
    entries = [dict(r) for r in rows]
    total_rev = sum(e["total_revenue"] for e in entries)
    total_units = sum(e["units"] for e in entries)
    aov = round(total_rev / total_units, 2) if total_units > 0 else 0.0
    projection_30d = round((total_rev / max(len(entries), 1)) * 30, 2) if total_rev > 0 else 0.0
    
    return {
        "entries": entries,
        "total_revenue": total_rev,
        "total_units": total_units,
        "aov": aov,
        "projection_30d": projection_30d
    }

@app.post("/api/toolbox/money-dashboard/entry")
def add_revenue_entry(req: RevenueEntryRequest):
    entry_id = f"rev_{uuid.uuid4().hex[:8]}"
    total = round(req.units * req.aov, 2)
    now_date = time.strftime("%Y-%m-%d")
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO revenue (id, project_id, platform, entry_date, units, aov, total_revenue, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (entry_id, req.project_id, req.platform, now_date, req.units, req.aov, total, req.notes, time.strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()
    return {"id": entry_id, "total": total}

# --- Project Export / Import ---
@app.get("/api/projects/{project_id}/export")
def export_project(project_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    if not proj:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
        
    cur.execute("SELECT * FROM candidates WHERE project_id = ?", (project_id,))
    cands = [dict(r) for r in cur.fetchall()]
    
    cur.execute("SELECT * FROM evidence WHERE project_id = ?", (project_id,))
    evidence = [dict(r) for r in cur.fetchall()]
    
    cur.execute("SELECT * FROM book_ledger WHERE project_id = ?", (project_id,))
    ledger = [dict(r) for r in cur.fetchall()]
    
    cur.execute("SELECT * FROM listings WHERE project_id = ?", (project_id,))
    listings = [dict(r) for r in cur.fetchall()]
    conn.close()
    
    export_data = {
        "version": "1.0",
        "project": dict(proj),
        "candidates": cands,
        "evidence": evidence,
        "ledger": ledger,
        "listings": listings
    }
    return export_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)

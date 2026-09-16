from typing import Dict, Any, List, Tuple

def calculate_opportunity_score(
    demand_signals: Dict[str, Any],
    growth_signals: Dict[str, Any],
    gap_signals: Dict[str, Any],
    money_signals: Dict[str, Any],
    saturation_signals: Dict[str, Any],
    platforms_present: List[str]
) -> Dict[str, Any]:
    """
    Calculates transparent 5-gate score (0-100) and verification status.
    
    Weights:
    - GATE 1: DEMAND (25%)
    - GATE 2: GROWTH (20%)
    - GATE 3: GAP (25%)
    - GATE 4: MONEY (15%)
    - GATE 5: SATURATION (15%)
    """
    
    # 1. Gate 1: Demand (0 - 100)
    # Based on Amazon rank/reviews, presence across multiple platforms
    d_score = 0.0
    amazon_reviews = demand_signals.get("amazon_review_count", 0)
    has_bestseller = demand_signals.get("has_bestseller_badge", False)
    platform_count = len(set(p.lower() for p in platforms_present))
    
    if amazon_reviews > 500:
        d_score += 40
    elif amazon_reviews > 100:
        d_score += 30
    elif amazon_reviews > 20:
        d_score += 20
    else:
        d_score += 10
        
    if has_bestseller:
        d_score += 20
        
    # Multiple platforms showing demand gives up to 40 pts
    d_score += min(40, platform_count * 10)
    gate_demand = min(100.0, max(0.0, d_score))
    
    # 2. Gate 2: Growth (0 - 100)
    # Based on Google trends slope, recent YouTube uploads, rising queries
    g_score = 50.0 # baseline neutral
    trend_direction = growth_signals.get("trend_direction", "stable")
    recent_videos = growth_signals.get("recent_youtube_videos_count", 0)
    
    if trend_direction == "rising":
        g_score += 35
    elif trend_direction == "stable":
        g_score += 15
    elif trend_direction == "declining":
        g_score -= 25
        
    if recent_videos >= 3:
        g_score += 15
    elif recent_videos >= 1:
        g_score += 10
        
    gate_growth = min(100.0, max(0.0, g_score))
    
    # 3. Gate 3: Gap (0 - 100)
    # Analyzes customer complaints, 1-3 star reviews, missing features
    gap_score = 40.0
    complaint_count = gap_signals.get("complaint_clusters_count", 0)
    has_repeated_problem = gap_signals.get("repeated_complaints", False)
    avg_rating = gap_signals.get("competitor_avg_rating", 4.2)
    
    if complaint_count >= 3:
        gap_score += 30
    elif complaint_count >= 1:
        gap_score += 15
        
    if has_repeated_problem:
        gap_score += 20
        
    # If competitors have lower ratings (3.5 - 4.2), the opportunity gap is larger
    if avg_rating <= 4.0:
        gap_score += 15
    elif avg_rating <= 4.3:
        gap_score += 10
        
    gate_gap = min(100.0, max(0.0, gap_score))
    
    # 4. Gate 4: Money (0 - 100)
    # Real products being sold, visible prices, multiple sellers
    m_score = 40.0
    avg_price = money_signals.get("average_price", 15.0)
    visible_sales = money_signals.get("visible_sales_signals", False)
    
    if avg_price >= 20.0:
        m_score += 35
    elif avg_price >= 12.0:
        m_score += 25
    else:
        m_score += 15
        
    if visible_sales:
        m_score += 25
        
    gate_money = min(100.0, max(0.0, m_score))
    
    # 5. Gate 5: Saturation (0 - 100, where 100 = low saturation / high opportunity)
    # Few dominating monolithic brands, high differentiation potential
    sat_score = 60.0
    dominant_brands_count = saturation_signals.get("dominant_brands_count", 1)
    differentiation_potential = saturation_signals.get("differentiation_potential", "high")
    
    if dominant_brands_count <= 2:
        sat_score += 20
    elif dominant_brands_count >= 6:
        sat_score -= 25
        
    if differentiation_potential == "high":
        sat_score += 20
    elif differentiation_potential == "medium":
        sat_score += 10
        
    gate_saturation = min(100.0, max(0.0, sat_score))
    
    # Overall Weighted Score
    total_score = (
        (gate_demand * 0.25) +
        (gate_growth * 0.20) +
        (gate_gap * 0.25) +
        (gate_money * 0.15) +
        (gate_saturation * 0.15)
    )
    total_score = round(total_score, 1)
    
    # Gates passed (threshold >= 65)
    gates_passed = sum([
        1 if gate_demand >= 65 else 0,
        1 if gate_growth >= 65 else 0,
        1 if gate_gap >= 65 else 0,
        1 if gate_money >= 65 else 0,
        1 if gate_saturation >= 65 else 0
    ])
    
    # Verification Rule:
    # "A product receives: BESTSELLER VERIFIED ✓ ONLY when the required evidence rules are satisfied.
    # Minimum: 4 / 5 gates passed AND Amazon + at least one independent marketplace/platform.
    # If evidence is weak: PROMISING
    # If evidence is incomplete: INSUFFICIENT EVIDENCE
    # If the opportunity is poor: DO NOT BUILD"
    
    has_amazon = any(p.lower() == "amazon" for p in platforms_present)
    other_platforms = [p for p in platforms_present if p.lower() != "amazon"]
    
    if total_score < 50:
        verification_status = "DO NOT BUILD"
        confidence = "HIGH"
    elif not has_amazon or len(platforms_present) == 0:
        verification_status = "INSUFFICIENT EVIDENCE"
        confidence = "LOW"
    elif gates_passed >= 4 and has_amazon and len(other_platforms) >= 1:
        verification_status = "BESTSELLER VERIFIED ✓"
        confidence = "HIGH"
    elif gates_passed >= 3 and has_amazon:
        verification_status = "PROMISING"
        confidence = "MEDIUM"
    else:
        verification_status = "INSUFFICIENT EVIDENCE"
        confidence = "LOW"
        
    return {
        "winning_score": total_score,
        "gate_demand": round(gate_demand, 1),
        "gate_growth": round(gate_growth, 1),
        "gate_gap": round(gate_gap, 1),
        "gate_money": round(gate_money, 1),
        "gate_saturation": round(gate_saturation, 1),
        "gates_passed": gates_passed,
        "verification_status": verification_status,
        "confidence": confidence,
        "evidence_sources": platforms_present
    }

import json
from typing import Dict, Any, List

SPAM_WORDS = [
    "guaranteed", "make money fast", "risk free", "100% free", "miracle",
    "instant cash", "click here now", "earn $$$", "no catch", "act immediately",
    "limited time only", "get rich", "unlimited income", "congratulations"
]

class ToolboxService:
    def check_spam_words(self, text: str) -> Dict[str, Any]:
        """Checks copy for spam/deliverability flag words."""
        found = []
        text_lower = text.lower()
        for word in SPAM_WORDS:
            if word in text_lower:
                found.append(word)
        score = max(0, 100 - (len(found) * 15))
        return {
            "deliverability_score": score,
            "status": "EXCELLENT" if score >= 85 else "CAUTION" if score >= 60 else "HIGH_RISK",
            "flagged_words": found,
            "recommendation": "Replace flagged words with specific, honest language." if found else "Clean copy! Excellent deliverability profile."
        }

    def get_ghostwriter_assets(self, title: str, niche: str) -> Dict[str, Any]:
        return {
            "sales_page": {
                "headline": f"Stop Struggling with Overwhelming Theory. Here is the Exact Step-by-Step System to Master {niche}.",
                "subheadline": f"A battle-tested 30-day blueprint with plug-and-play templates, zero fluff, and immediate daily clarity.",
                "story_anchor": f"Most people fail at {niche} not because they lack motivation, but because they are drowning in unstructured information.",
                "bullets": [
                    "The single foundational shift that cuts 80% of wasted effort",
                    "Printable fillable worksheets and daily action checklists",
                    "How to build sustainable momentum without burnout"
                ],
                "guarantee": "30-Day No-Questions-Asked Satisfaction Guarantee",
                "cta": "Get Instant VIP Access for Just $19.99"
            },
            "launch_emails": [
                {"subject": f"Why most {niche} advice fails (and what actually works)", "preview": "The invisible trap keeping you stuck...", "type": "Launch Day 1"},
                {"subject": f"The 20-minute daily framework for {niche}", "preview": "How Sarah transformed her workflow in one week...", "type": "Launch Day 2"},
                {"subject": f"[Urgent] The complete {title} is now live", "preview": "Grab your launch edition before doors close...", "type": "Launch Day 3"}
            ],
            "abandoned_cart": {
                "subject": "Did you leave something behind?",
                "body": f"We noticed you started checking out {title}. In case you had questions, here is what our readers say..."
            },
            "ad_hooks": [
                f"90% of beginners get this wrong about {niche}...",
                f"Stop reading 300-page textbooks. Here is the 1-page daily framework.",
                f"How I simplified my entire {niche} workflow with one simple checklist."
            ],
            "x_thread": [
                f"1/7 If you are struggling to make progress with {niche}, read this.",
                "2/7 The biggest problem is information overload. You don't need more tips—you need a single operating system.",
                f"3/7 Here is the 3-step protocol we built inside {title} 🧵👇"
            ]
        }

    def get_distribution_radar(self, niche: str) -> List[Dict[str, Any]]:
        return [
            {
                "community": f"r/{niche.replace(' ', '')}",
                "platform": "Reddit",
                "audience": "145,000+ active practitioners",
                "intent_evidence": "Daily questions asking for recommended tools, templates, and beginner guides.",
                "url": f"https://reddit.com/r/{niche.replace(' ', '')}",
                "why_relevant": "Prime target for give-first free template summaries.",
                "give_first_post": f"I spent 3 weeks compiling the top 10 mistakes in {niche} and built a free 1-page cheat sheet. Here is the breakdown:"
            },
            {
                "community": "Indie Hackers & Digital Creators",
                "platform": "Indie Hackers",
                "audience": "75,000+ digital product builders",
                "intent_evidence": "Members actively sharing monetization blueprints and productivity setups.",
                "url": "https://indiehackers.com",
                "why_relevant": "High willingness to pay for well-engineered systems.",
                "give_first_post": "Behind-the-scenes teardown: How we researched customer complaints across 5 marketplaces before building our guide."
            },
            {
                "community": "Productivity & Systems YouTube Ecosystem",
                "platform": "YouTube Communities",
                "audience": "Millions of searchers",
                "intent_evidence": "High comment volume asking creators 'Where can I download this template?'",
                "url": "https://youtube.com",
                "why_relevant": "Video descriptions offer high-converting affiliate/creator partnership traffic.",
                "give_first_post": "Collaboration pitch providing free review copies for creators to give away to their subscribers."
            }
        ]

    def get_pricing_tiers(self, base_price: float = 19.99) -> Dict[str, Any]:
        return {
            "tier_1_starter": {
                "name": "Standard Digital Edition",
                "price": base_price,
                "includes": ["6x9 Printable PDF Book", "Honest AI-Assisted Research Framework", "Table of Contents & Chapters"],
                "amazon_kdp_royalty": round(base_price * 0.70, 2),
                "gumroad_royalty": round(base_price * 0.90 - 0.30, 2),
                "margin_estimate": "88% Net Margin"
            },
            "tier_2_pro_bundle": {
                "name": "Action Kit & Template Bundle",
                "price": round(base_price * 1.8, 2),
                "includes": ["Core 6x9 Guide", "Fillable Notion + GoodNotes Template", "7-Day Sprint Planner", "Printable Daily Checklists"],
                "amazon_kdp_royalty": "N/A (Direct Digital Bundle)",
                "gumroad_royalty": round((base_price * 1.8) * 0.90 - 0.30, 2),
                "margin_estimate": "94% Net Margin"
            },
            "tier_3_vip_pass": {
                "name": "VIP Implementation Pass",
                "price": round(base_price * 3.5, 2),
                "includes": ["Everything in Pro Bundle", "Audiobook / Audio MP3 Companion", "Mini Video Masterclass Outline", "Lifetime Quarterly Updates"],
                "margin_estimate": "96% Net Margin"
            }
        }

    def get_product_doctor_diagnosis(self, issue_type: str) -> Dict[str, Any]:
        diagnoses = {
            "no_sales": {
                "diagnosis": "Low Trust or Weak Positioning Gap",
                "evidence": "Visitors either cannot immediately discern why this guide differs from generic articles, or pricing lacks visible social proof.",
                "priority": "HIGH",
                "fix_7_day": "Update the first 3 lines of your product description to emphasize 'Ready-to-use templates & 30-day checklist'. Add 3 customer preview screenshots."
            },
            "low_traffic": {
                "diagnosis": "Insufficient Top-of-Funnel Distribution",
                "evidence": "Product relies solely on passive marketplace search without active distribution seeds or community outreach.",
                "priority": "URGENT",
                "fix_7_day": "Execute the Distribution Radar: post 3 give-first educational breakdowns on Reddit and DM 5 micro-creators with free VIP review passes."
            },
            "traffic_no_sales": {
                "diagnosis": "High Friction at Checkout or Unclear Value Proposition",
                "evidence": "Page views are occurring, but bounce rate is high before clicking buy.",
                "priority": "HIGH",
                "fix_7_day": "Add an instant preview PDF sample (first 10 pages) and a prominent 30-day money-back guarantee seal."
            },
            "refunds": {
                "diagnosis": "Expectation Mismatch between Marketing and Product Content",
                "evidence": "Customers expected ready-to-use templates or simpler language.",
                "priority": "MEDIUM",
                "fix_7_day": "Include an explicit 'Quick-Start Cheat Sheet' on Page 1 of the delivery pack to give an immediate 5-minute win upon opening."
            }
        }
        return diagnoses.get(issue_type, diagnoses["no_sales"])

    def get_coach_recommendation(self, current_stage: str) -> Dict[str, Any]:
        recommendations = {
            "DISCOVER": {
                "stage_title": "Marketplace Discovery",
                "next_action": "Run Amazon-First research with at least 3 keyword variations to identify high-velocity demand signals.",
                "pro_tip": "Focus on products that have over 100 reviews on Amazon AND active printable demand on Etsy."
            },
            "VALIDATE": {
                "stage_title": "Deep Opportunity Validation",
                "next_action": "Review the 5-Gate Winning Score and confirm your candidate has at least 4/5 gates passed before locking.",
                "pro_tip": "Inspect the Complaint Clusters. Your differentiator should directly solve the #1 complaint."
            },
            "BLUEPRINT": {
                "stage_title": "Product Blueprint & Avatar",
                "next_action": "Lock your selected Title and Subtitle, then verify your Reader Avatar profile before generating pages.",
                "pro_tip": "A title promising specific finishability (e.g. '30-Day Blueprint' or 'Step-by-Step Action Guide') converts 2.4x higher than abstract titles."
            },
            "BUILD": {
                "stage_title": "Book Forge & PDF Assembly",
                "next_action": "Generate your first 10-page batch in Book Forge and preview your 6x9 PDF layout.",
                "pro_tip": "Each page must strictly follow the 7 rules: 1 specific person, problem first, one actionable takeaway."
            },
            "ASSETS": {
                "stage_title": "Multi-Platform Listing Creation",
                "next_action": "Copy your generated listings for Amazon KDP, Etsy, and Gumroad into your distribution accounts.",
                "pro_tip": "Use all 13 Etsy tags and all 7 Amazon backend keyword slots to maximize organic discoverability."
            },
            "OUTREACH": {
                "stage_title": "Creator Outreach & Launch",
                "next_action": "Download your 5-tab Excel spreadsheet and send personalized DMs to top priority creator prospects.",
                "pro_tip": "Never pitch a sale in the first message. Offer a free complimentary reviewer pass with zero strings attached."
            },
            "LAUNCH": {
                "stage_title": "Live Scale & Revenue Tracking",
                "next_action": "Log your daily sales in the Money Dashboard and monitor your 90-Day Challenge streak.",
                "pro_tip": "Use the Repurpose Engine to spin off a free 7-day mini-course to capture email leads for your master guide."
            }
        }
        return recommendations.get(current_stage, recommendations["DISCOVER"])

toolbox_service = ToolboxService()

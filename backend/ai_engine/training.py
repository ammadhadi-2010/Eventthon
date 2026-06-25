"""Intent catalogs, feature weight matrices, and score benchmarks."""

HIGHLIGHT_CONFIDENCE_THRESHOLD = 75.0

SUPPORTED_CONTEXTS = frozenset({"project", "gig", "job", "article", "achievement"})
HIGHLIGHT_CONTEXTS = SUPPORTED_CONTEXTS

POST_TYPE_TO_CONTEXT = {
    "PROJECT": "project",
    "WIN": "achievement",
    "GIG": "gig",
    "JOB": "job",
    "ARTICLE": "article",
}

# Compact high-value intent token map used by the inference engine.
HIGH_VALUE_INTENT_TOKENS = {
    "project": ["milestone", "completed", "shipped", "80%", "90%", "launch", "budget", "roadmap"],
    "gig": ["premium", "enterprise", "package", "published", "retainer", "consulting", "audit"],
    "job": ["senior", "lead", "remote", "salary", "compensation", "100k", "hiring"],
    "article": ["architecture", "tutorial", "deep dive", "framework", "benchmark", "case study"],
    "achievement": ["certified", "certification", "award", "revenue", "milestone", "badge", "won"],
}

# Phrase intents scored when matched inside title or description text.
CONTEXT_INTENT_VECTORS = {
    "project": [
        {"label": "milestone_complete", "phrases": ["completed", "milestone", "shipped", "launched", "delivered"], "weight": 14},
        {"label": "high_progress", "phrases": ["80%", "90%", "100%", "near completion", "almost done"], "weight": 16},
        {"label": "collaboration", "phrases": ["collab", "team", "squad", "contributors", "roadmap"], "weight": 8},
        {"label": "funding_signal", "phrases": ["budget", "funded", "investment", "contract signed"], "weight": 12},
    ],
    "gig": [
        {"label": "premium_service", "phrases": ["premium", "enterprise", "audit", "consulting", "expert"], "weight": 14},
        {"label": "high_value_offer", "phrases": ["starting at", "package", "tier", "retainer", "fixed price"], "weight": 10},
        {"label": "marketplace_launch", "phrases": ["published", "now live", "available", "open for orders"], "weight": 12},
    ],
    "job": [
        {"label": "senior_role", "phrases": ["senior", "lead", "principal", "architect", "staff"], "weight": 14},
        {"label": "remote_premium", "phrases": ["remote", "hybrid", "global", "visa sponsor"], "weight": 10},
        {"label": "competitive_pay", "phrases": ["salary", "compensation", "bonus", "equity", "100k"], "weight": 16},
    ],
    "article": [
        {"label": "technical_depth", "phrases": ["architecture", "implementation", "deep dive", "benchmark", "pattern"], "weight": 16},
        {"label": "tutorial_signal", "phrases": ["guide", "tutorial", "how to", "walkthrough", "best practices"], "weight": 12},
        {"label": "research_signal", "phrases": ["analysis", "case study", "research", "framework", "scalable"], "weight": 14},
    ],
    "achievement": [
        {"label": "certification", "phrases": ["certified", "certification", "badge", "credential"], "weight": 18},
        {"label": "revenue_win", "phrases": ["revenue", "sales target", "quota", "mrr", "arr"], "weight": 16},
        {"label": "personal_best", "phrases": ["personal best", "record", "milestone", "award", "won"], "weight": 14},
    ],
}

# Numeric and metadata feature weights used after text intent scoring.
FEATURE_WEIGHT_MATRIX = {
    "project": {
        "progress_percent": {"weight": 22, "tiers": [(80, 1.0), (60, 0.65), (40, 0.35)]},
        "milestones": {"weight": 12, "tiers": [(4, 1.0), (2, 0.5)]},
        "budget": {"weight": 14, "tiers": [(5000, 1.0), (2000, 0.55), (500, 0.25)]},
        "description_length": {"weight": 8, "tiers": [(180, 1.0), (90, 0.5)]},
    },
    "gig": {
        "starting_price": {"weight": 20, "tiers": [(400, 1.0), (250, 0.6), (100, 0.3)]},
        "description_length": {"weight": 10, "tiers": [(400, 1.0), (200, 0.55)]},
    },
    "job": {
        "salary_max": {"weight": 18, "tiers": [(100, 1.0), (90, 0.7), (70, 0.35)]},
        "salary_min": {"weight": 12, "tiers": [(90, 1.0), (70, 0.55)]},
        "description_length": {"weight": 8, "tiers": [(160, 1.0), (80, 0.45)]},
    },
    "article": {
        "word_count": {"weight": 18, "tiers": [(700, 1.0), (450, 0.6), (250, 0.3)]},
        "seo_score": {"weight": 14, "tiers": [(70, 1.0), (55, 0.55), (40, 0.25)]},
        "reading_time": {"weight": 6, "tiers": [(8, 1.0), (4, 0.5)]},
    },
    "achievement": {
        "premium_metric": {"weight": 20, "values": {"certification": 1.0, "revenue_goal": 1.0, "personal_best": 0.85, "milestone": 0.6}},
        "content_length": {"weight": 12, "tiers": [(160, 1.0), (90, 0.5)]},
    },
}

# Minimum confidence required before numeric-only weak signals can pass.
SCORE_BENCHMARKS = {
    "project": {"intent_floor": 18, "numeric_floor": 24},
    "gig": {"intent_floor": 16, "numeric_floor": 22},
    "job": {"intent_floor": 14, "numeric_floor": 20},
    "article": {"intent_floor": 16, "numeric_floor": 22},
    "achievement": {"intent_floor": 14, "numeric_floor": 18},
}

# Maximum achievable raw score per context before normalization to percentage.
CONTEXT_SCORE_CEILINGS = {
    "project": 78,
    "gig": 62,
    "job": 60,
    "article": 66,
    "achievement": 56,
}

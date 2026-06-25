"""Default public showroom content when DB fields are missing."""

DEFAULT_PROJECT_METRICS = [
    {"id": "traffic", "label": "Organic Traffic", "value": "12.4K", "delta": "+18.6% (30 days)", "tone": "green"},
    {"id": "keywords", "label": "Keyword Ranking", "value": "325", "hint": "Top 10 Keywords", "tone": "violet"},
    {"id": "backlinks", "label": "Backlinks", "value": "1.8K", "delta": "+21.3% (30 days)", "tone": "blue"},
    {"id": "seo_score", "label": "SEO Score", "value": "92/100", "hint": "Excellent", "tone": "green"},
    {"id": "performance", "label": "Performance", "value": "98%", "hint": "Core Web Vitals", "tone": "green"},
]

DEFAULT_PROJECT_HIGHLIGHTS = [
    {"title": "Built With Modern Stack", "subtitle": "React, Node.js, MongoDB"},
    {"title": "Real-time Analytics", "subtitle": "Live traffic and keyword tracking"},
    {"title": "SEO Optimized & Fast", "subtitle": "High performance score"},
    {"title": "Team Collaboration", "subtitle": "Squad-based workflows"},
    {"title": "Public Portfolio Ready", "subtitle": "Shareable showroom links"},
]

DEFAULT_PROJECT_MILESTONES = [
    {"title": "Planning Complete", "status": "completed", "progress": 100},
    {"title": "Core Build", "status": "in-progress", "progress": 70},
    {"title": "Public Launch", "status": "pending", "progress": 0},
]

DEFAULT_PROJECT_FEATURES = [
    "Real-time metrics tracking",
    "Collaboration-ready workspace",
    "Public SEO preview",
]

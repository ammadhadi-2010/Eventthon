"""Defaults for public gig & job marketplace showrooms."""

GIG_DELIVERABLES = ["PDF", "XLSX", "DOCX", "MP4"]

GIG_TRUST_BADGES = [
    {"key": "secure", "label": "Secure Payment"},
    {"key": "satisfaction", "label": "100% Satisfaction"},
    {"key": "support", "label": "24/7 Support"},
    {"key": "verified", "label": "ET Verified Seller"},
    {"key": "ontime", "label": "On-time Delivery"},
]

JOB_BOARD_STATS = [
    {"id": "active", "label": "Active Jobs", "value": "12.4K", "delta": "+18.6% this week"},
    {"id": "companies", "label": "Companies Hiring", "value": "1.8K", "delta": "+21.3% this week"},
    {"id": "remote", "label": "Remote Jobs", "value": "9.2K", "delta": "+16.6% this week"},
    {"id": "salary", "label": "Avg. Salary", "value": "$85K", "delta": "+12.4% this week"},
]

JOB_BOARD_FILTERS = [
    "Remote", "Hybrid", "Full-time", "Contract", "Worldwide", "Visa Sponsored", "More Filters",
]

BOARD_TRUST_BADGES = [
    "Secure & Verified", "Global Opportunities", "Safe & Trusted", "24/7 Support",
]

APPLICATION_FLOW_STEPS = [
    {"id": "applied", "label": "Applied", "status": "completed"},
    {"id": "review", "label": "Under Review", "status": "active"},
    {"id": "interview", "label": "Interview", "status": "pending"},
    {"id": "technical", "label": "Technical Task", "status": "pending"},
    {"id": "hired", "label": "Hired", "status": "pending"},
]

REMOTE_BENEFIT_TAGS = [
    "Fully Remote", "Work From Anywhere", "Flexible Hours", "Mental Health Support", "Learning Budget",
]

DEFAULT_FUNCTIONAL_REQUIREMENTS = [
    "Production experience with the listed tech stack and shipping cadence.",
    "Strong written communication for async, remote-first collaboration.",
    "Portfolio or work samples demonstrating measurable product outcomes.",
    "Ability to work across time zones with global stakeholders.",
]

DEFAULT_SELLER_PROFILE = {
    "displayName": "Ahmad Hadi",
    "level": "Level 2 Seller",
    "location": "Pakistan",
    "reach": "Worldwide",
    "languages": ["English", "Urdu"],
    "responseTime": "1h response",
}


def _round_days(n: float) -> int:
    return max(1, round(n))


def build_gig_packages(base_price: float, delivery_days: int, is_seo: bool = False) -> list:
    base = int(base_price) or 120
    days = int(delivery_days) or 5
    if is_seo:
        features = {
            "basic": ["SEO Audit (Up to 150 Pages)", "On-Page Optimization Report", "Keywords Research (50)"],
            "standard": ["Everything in Basic", "Technical SEO Fixes", "Competitor Analysis", "Keywords Research (150)"],
            "premium": ["Everything in Standard", "Full Site SEO Strategy", "Backlink Outreach Plan", "30-Day Support"],
        }
    else:
        features = {
            "basic": ["Core deliverables", "Source files", "1 revision"],
            "standard": ["Everything in Basic", "3 revisions", "Priority delivery"],
            "premium": ["Everything in Standard", "Premium support", "Rush delivery"],
        }
    return [
        {
            "id": "basic", "name": "Basic", "price": base,
            "description": "Essential deliverables with standard turnaround.",
            "deliveryDays": days, "revisions": 1, "features": features["basic"],
        },
        {
            "id": "standard", "name": "Standard", "price": base * 2,
            "description": "Most popular package with extended revisions.",
            "deliveryDays": _round_days(days * 0.85), "revisions": 3, "popular": True,
            "features": features["standard"],
        },
        {
            "id": "premium", "name": "Premium", "price": int(base * 3.75),
            "description": "Full-service bundle with premium support.",
            "deliveryDays": _round_days(days * 0.65), "revisions": 5,
            "features": features["premium"],
        },
    ]


def build_gig_reviews(seller_name: str) -> list:
    return [
        {"id": "r1", "name": "Sarah Mitchell", "country": "United States", "rating": 5,
         "text": f"Outstanding work from {seller_name}. Delivered ahead of schedule with clear communication."},
        {"id": "r2", "name": "James Chen", "country": "Canada", "rating": 5,
         "text": "Professional quality and attention to detail. Would order again on EventThon."},
        {"id": "r3", "name": "Elena Rodriguez", "country": "Spain", "rating": 5,
         "text": "Great results and fast revisions. Highly recommended for marketplace buyers."},
        {"id": "r4", "name": "David Park", "country": "United Kingdom", "rating": 4,
         "text": "Clear reporting and actionable SEO recommendations for our global storefront."},
    ]

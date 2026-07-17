"""Lead Hunter — URL/email parsing and outreach-ready filtering."""

from __future__ import annotations

import re
from html import unescape
from urllib.parse import urljoin, urlparse

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
HREF_RE = re.compile(r"""href\s*=\s*["']([^"'#]+)["']""", re.I)
MAILTO_RE = re.compile(r"^mailto:([^?&#\s]+)", re.I)
TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.I)

CONTACT_SLUGS = (
    "contact",
    "contact-us",
    "contact_us",
    "about",
    "about-us",
    "services",
    "get-in-touch",
    "support",
)

JUNK_HOSTS = (
    "facebook.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "tiktok.com",
    "pinterest.com",
    "wa.me",
    "t.me",
    "bit.ly",
    "goo.gl",
)
JUNK_EXTENSIONS = (
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".webp",
    ".css",
    ".js",
    ".zip",
    ".mp4",
    ".woff",
    ".woff2",
)
BLOCKED_LOCAL = (
    "noreply",
    "no-reply",
    "donotreply",
    "mailer-daemon",
    "postmaster",
)
BLOCKED_DOMAINS = {
    "example.com",
    "test.com",
    "email.com",
    "domain.com",
    "sentry.io",
    "wixpress.com",
    "placeholder.com",
    "yourdomain.com",
    "yoursite.com",
    "sample.com",
}


def _host(url: str) -> str:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    return (parsed.netloc or "").lower().replace("www.", "")


def registrable_domain(host: str) -> str:
    host = (host or "").lower().replace("www.", "")
    if not host:
        return ""
    parts = host.split(".")
    if len(parts) <= 2:
        return host
    return ".".join(parts[-2:])


def normalize_url(base: str, href: str) -> str | None:
    raw = unescape((href or "").strip())
    if not raw or raw.startswith("#"):
        return None
    if MAILTO_RE.match(raw) or raw.lower().startswith(("tel:", "javascript:", "data:")):
        return None
    joined = urljoin(base, raw)
    parsed = urlparse(joined)
    if parsed.scheme not in ("http", "https"):
        return None
    return joined.split("#")[0].rstrip("/")


def is_junk_url(url: str) -> bool:
    low = url.lower()
    if any(low.endswith(ext) for ext in JUNK_EXTENSIONS):
        return True
    host = _host(url)
    return any(junk in host for junk in JUNK_HOSTS)


def is_same_site(url: str, base_domain: str) -> bool:
    host = registrable_domain(_host(url))
    return bool(host) and host == base_domain


def contact_page_urls(base_url: str) -> list[str]:
    parsed = urlparse(base_url if "://" in base_url else f"https://{base_url}")
    root = f"{parsed.scheme}://{parsed.netloc}"
    seen: set[str] = set()
    out: list[str] = []
    for path in ["", *CONTACT_SLUGS]:
        url = f"{root}/{path}".rstrip("/") if path else root
        norm = normalize_url(url, url)
        if norm and norm not in seen:
            seen.add(norm)
            out.append(norm)
    return out


def filter_scrape_links(base_url: str, html: str, *, limit: int = 8) -> list[str]:
    base_domain = registrable_domain(_host(base_url))
    seen: set[str] = set()
    out: list[str] = []
    for match in HREF_RE.finditer(html or ""):
        url = normalize_url(base_url, match.group(1))
        if not url or url in seen:
            continue
        if is_junk_url(url) or not is_same_site(url, base_domain):
            continue
        low = url.lower()
        if not any(slug in low for slug in CONTACT_SLUGS):
            continue
        seen.add(url)
        out.append(url)
        if len(out) >= limit:
            break
    return out


def _email_allowed(email: str, allowed_domains: set[str]) -> bool:
    addr = (email or "").strip().lower()
    if "@" not in addr or len(addr) > 200:
        return False
    if any(token in addr for token in BLOCKED_LOCAL):
        return False
    local, domain = addr.rsplit("@", 1)
    if not local or domain in BLOCKED_DOMAINS:
        return False
    if any(domain.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")):
        return False
    root = registrable_domain(domain)
    if root not in allowed_domains:
        return False
    return bool(EMAIL_RE.fullmatch(addr))


def extract_verified_emails(html: str, allowed_domains: set[str]) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    text = unescape(html or "")
    for match in EMAIL_RE.finditer(text):
        email = match.group(0).lower()
        if email in seen or not _email_allowed(email, allowed_domains):
            continue
        seen.add(email)
        found.append(email)
    for match in HREF_RE.finditer(text):
        href = match.group(1).strip()
        mail = MAILTO_RE.match(href)
        if not mail:
            continue
        email = mail.group(1).split("?")[0].strip().lower()
        if email in seen or not _email_allowed(email, allowed_domains):
            continue
        seen.add(email)
        found.append(email)
    return found


def company_from_html(html: str, fallback_domain: str) -> str:
    match = TITLE_RE.search(html or "")
    if match:
        title = unescape(match.group(1)).strip()
        for sep in ("|", "-", "–", "—", ":"):
            if sep in title:
                parts = [p.strip() for p in title.split(sep) if p.strip()]
                if parts:
                    return parts[-1][:160]
        if 2 < len(title) < 90:
            return title[:160]
    return company_from_domain(fallback_domain)


def company_from_domain(domain: str) -> str:
    slug = (domain.split(".")[0] if domain else "partner").strip()
    clean = re.sub(r"[^a-z0-9]", "", slug.lower())
    return clean.title() if clean else "Partner"

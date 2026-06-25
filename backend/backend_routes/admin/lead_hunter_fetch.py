"""Lead Hunter — HTTP fetch helpers (stdlib only, EventThon native)."""

from __future__ import annotations

import urllib.error
import urllib.request

USER_AGENT = "EventThon-LeadHunter/1.0 (+https://eventthon.network)"
TIMEOUT_SEC = 18
MAX_BYTES = 1_500_000


def fetch_page_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
        raw = resp.read(MAX_BYTES + 1)
    if len(raw) > MAX_BYTES:
        raw = raw[:MAX_BYTES]
    charset = "utf-8"
    try:
        return raw.decode(charset, errors="replace")
    except LookupError:
        return raw.decode("utf-8", errors="replace")


def safe_fetch(url: str) -> str:
    try:
        return fetch_page_html(url)
    except (urllib.error.URLError, TimeoutError, ValueError):
        return ""

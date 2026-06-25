"""Text parsing and feature extraction for local inference."""
from __future__ import annotations

import re
from typing import Any

WORD_RE = re.compile(r"[a-z0-9]+(?:'[a-z]+)?", re.I)
NUMBER_RE = re.compile(r"(\d+(?:\.\d+)?)")
PERCENT_RE = re.compile(r"(\d{1,3})\s*%")
CURRENCY_RE = re.compile(r"[$€£]\s*(\d+(?:\.\d+)?)\s*([kKmM])?")
BUDGET_RE = re.compile(r"budget\s*(?:of|is|:)?\s*[$€£]?\s*(\d+(?:\.\d+)?)\s*([kKmM])?", re.I)


def normalize_text(value: Any) -> str:
    text = str(value or "").lower()
    return re.sub(r"\s+", " ", text).strip()


def tokenize_text(value: Any) -> list[str]:
    return WORD_RE.findall(normalize_text(value))


def parse_metric_parameters(text: Any) -> dict[str, float | int]:
    """Extract progress, budget, and currency signals from free-form text."""
    blob = normalize_text(text)
    metrics: dict[str, float | int] = {}

    percents = [int(value) for value in PERCENT_RE.findall(blob) if 0 <= int(value) <= 100]
    if percents:
        metrics["progress_percent"] = max(percents)

    budget_match = BUDGET_RE.search(blob)
    if budget_match:
        metrics["budget"] = _scale_currency_value(budget_match.group(1), budget_match.group(2))

    currency_hits = CURRENCY_RE.findall(blob)
    if currency_hits:
        peak = max(_scale_currency_value(raw, suffix) for raw, suffix in currency_hits)
        metrics["starting_price"] = peak
        metrics["budget"] = max(float(metrics.get("budget") or 0), peak)

    numbers = [float(num) for num in NUMBER_RE.findall(blob)]
    if numbers and "salary_max" not in metrics:
        salary_like = [num for num in numbers if num >= 50]
        if salary_like and any(token in blob for token in ("salary", "compensation", "pay", "k")):
            metrics["salary_max"] = int(max(salary_like))
            metrics["salary_min"] = int(min(salary_like))

    return metrics


def _scale_currency_value(raw: str, suffix: str | None) -> float:
    value = float(raw or 0)
    if str(suffix or "").lower() == "k":
        return value * 1000
    return value


def join_title_description(metrics: dict) -> str:
    parts = [
        metrics.get("title"),
        metrics.get("content"),
        metrics.get("description"),
        metrics.get("message"),
        metrics.get("summary"),
    ]
    return normalize_text(" ".join(str(part or "") for part in parts if part))


def phrase_hits(text: str, phrases: list[str]) -> int:
    hits = 0
    for phrase in phrases:
        token = normalize_text(phrase)
        if token and token in text:
            hits += 1
    return hits


def tier_score(raw_value: float, tiers: list[tuple[float, float]]) -> float:
    value = float(raw_value or 0)
    best = 0.0
    for threshold, multiplier in tiers:
        if value >= threshold:
            best = max(best, multiplier)
    return best


def numeric_feature_value(feature_key: str, metrics: dict) -> float:
    if feature_key == "description_length":
        return float(len(join_title_description(metrics)))
    if feature_key == "content_length":
        return float(len(normalize_text(metrics.get("content") or "")))
    if feature_key == "premium_metric":
        return normalize_text(metrics.get("achievement_metric") or "milestone")
    return float(metrics.get(feature_key) or 0)


def extract_syntax_features(metrics: dict) -> dict[str, float | str]:
    text = join_title_description(metrics)
    tokens = tokenize_text(text)
    numbers = [float(n) for n in NUMBER_RE.findall(text)]
    return {
        "text_blob": text,
        "token_count": float(len(tokens)),
        "unique_token_ratio": float(len(set(tokens)) / max(len(tokens), 1)),
        "number_count": float(len(numbers)),
        "max_number": float(max(numbers) if numbers else 0),
        "has_percent_signal": 1.0 if "%" in text else 0.0,
        "has_currency_signal": 1.0 if any(sym in text for sym in ("$", "usd", "k ", "k+", "salary")) else 0.0,
    }


def build_context_payload(context: str, metrics: dict) -> dict:
    clean_context = normalize_text(context)
    merged = dict(metrics or {})
    parsed = parse_metric_parameters(join_title_description(merged))
    for key, value in parsed.items():
        merged.setdefault(key, value)
    syntax = extract_syntax_features(merged)
    return {
        "context": clean_context,
        "metrics": merged,
        "syntax": syntax,
        "text_blob": syntax["text_blob"],
    }

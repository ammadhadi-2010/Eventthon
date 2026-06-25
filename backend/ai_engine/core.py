"""Local inference pipeline for EventThon highlight classification."""
from __future__ import annotations

from dataclasses import dataclass, field

from ai_engine.processors import (
    build_context_payload,
    numeric_feature_value,
    parse_metric_parameters,
    phrase_hits,
    tier_score,
)
from ai_engine.training import (
    CONTEXT_INTENT_VECTORS,
    CONTEXT_SCORE_CEILINGS,
    FEATURE_WEIGHT_MATRIX,
    HIGHLIGHT_CONFIDENCE_THRESHOLD,
    HIGH_VALUE_INTENT_TOKENS,
    POST_TYPE_TO_CONTEXT,
    SCORE_BENCHMARKS,
    SUPPORTED_CONTEXTS,
)


@dataclass
class HighlightVerdict:
    context: str
    confidence_score: float
    is_milestone_highlight: bool
    intent_score: float
    numeric_score: float
    matched_intents: list[str] = field(default_factory=list)
    reason: str = ""


class EventThonAIEngine:
    """Rule-and-pattern inference engine with weighted confidence scoring."""

    def __init__(self, threshold: float = HIGHLIGHT_CONFIDENCE_THRESHOLD) -> None:
        self.threshold = float(threshold)

    def resolve_context(self, context: str | None = None, post_type: str | None = None) -> str:
        clean = str(context or "").strip().lower()
        if clean in SUPPORTED_CONTEXTS:
            return clean
        mapped = POST_TYPE_TO_CONTEXT.get(str(post_type or "").upper(), "")
        return mapped if mapped in SUPPORTED_CONTEXTS else ""

    def evaluate_highlight(
        self,
        title: str,
        description: str,
        post_type: str,
        extra_metrics: dict | None = None,
    ) -> dict:
        """Primary API: returns carousel flag when confidence exceeds threshold."""
        context = self.resolve_context(post_type=post_type)
        parsed = parse_metric_parameters(f"{title} {description}")
        metrics = {
            "title": str(title or ""),
            "content": str(description or ""),
            **parsed,
            **(extra_metrics or {}),
        }
        verdict = self._run_inference(context, metrics)
        return {
            "context": verdict.context,
            "confidence_score": verdict.confidence_score,
            "is_carousel_update": verdict.is_milestone_highlight,
            "matched_intents": verdict.matched_intents,
            "reason": verdict.reason,
        }

    def evaluate_metrics(self, context: str, metrics: dict | None = None) -> HighlightVerdict:
        return self._run_inference(str(context or "").strip().lower(), metrics or {})

    def _run_inference(self, context: str, metrics: dict) -> HighlightVerdict:
        payload = build_context_payload(context, metrics)
        clean_context = payload["context"]
        if clean_context not in SUPPORTED_CONTEXTS:
            return HighlightVerdict(
                context=clean_context,
                confidence_score=0.0,
                is_milestone_highlight=False,
                intent_score=0.0,
                numeric_score=0.0,
                reason="Unsupported context",
            )

        intent_score, matched = self._score_intents(clean_context, payload["text_blob"])
        numeric_score = self._score_numeric_features(clean_context, payload["metrics"])
        confidence = self._normalize_confidence(clean_context, intent_score, numeric_score)
        benchmark = SCORE_BENCHMARKS.get(clean_context, {})
        passes_floor = (
            intent_score >= float(benchmark.get("intent_floor", 0))
            or numeric_score >= float(benchmark.get("numeric_floor", 0))
        )
        is_highlight = confidence > self.threshold and passes_floor
        return HighlightVerdict(
            context=clean_context,
            confidence_score=round(confidence, 2),
            is_milestone_highlight=is_highlight,
            intent_score=round(intent_score, 2),
            numeric_score=round(numeric_score, 2),
            matched_intents=matched,
            reason=self._build_reason(is_highlight, confidence, matched),
        )

    def _score_intents(self, context: str, text_blob: str) -> tuple[float, list[str]]:
        total = 0.0
        matched: list[str] = []
        for intent in CONTEXT_INTENT_VECTORS.get(context, []):
            hits = phrase_hits(text_blob, intent.get("phrases", []))
            if hits <= 0:
                continue
            weight = float(intent.get("weight", 0))
            total += weight * min(hits, 2)
            matched.append(str(intent.get("label") or "intent"))

        token_weight = 4.0
        for token in HIGH_VALUE_INTENT_TOKENS.get(context, []):
            if normalize_token(token) in text_blob:
                total += token_weight
                matched.append(token)
        return total, matched

    def _score_numeric_features(self, context: str, metrics: dict) -> float:
        matrix = FEATURE_WEIGHT_MATRIX.get(context, {})
        total = 0.0
        for feature_key, spec in matrix.items():
            weight = float(spec.get("weight", 0))
            raw_value = numeric_feature_value(feature_key, metrics)
            if feature_key == "premium_metric":
                values = spec.get("values", {})
                multiplier = float(values.get(str(raw_value), 0.0))
            else:
                multiplier = tier_score(raw_value, spec.get("tiers", []))
            total += weight * multiplier
        return total

    def _normalize_confidence(self, context: str, intent_score: float, numeric_score: float) -> float:
        ceiling = float(CONTEXT_SCORE_CEILINGS.get(context, 60))
        raw_total = intent_score + numeric_score
        ratio = min(raw_total / max(ceiling, 1), 1.0)
        return max(0.0, min(ratio * 100.0, 100.0))

    def _build_reason(self, is_highlight: bool, confidence: float, matched: list[str]) -> str:
        if is_highlight:
            labels = ", ".join(matched[:3]) if matched else "numeric thresholds"
            return f"High-value milestone detected at {confidence:.1f}% ({labels})."
        return f"Below highlight threshold at {confidence:.1f}%."


def normalize_token(value: str) -> str:
    return str(value or "").strip().lower()

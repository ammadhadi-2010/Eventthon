"""Lead Hunter — localized search query builders."""

from __future__ import annotations

COUNTRY_TLD: dict[str, str] = {
    "AE": "ae",
    "SA": "sa",
    "PK": "pk",
    "IN": "in",
    "GB": "uk",
    "AU": "au",
    "CA": "ca",
    "DE": "de",
    "FR": "fr",
    "IT": "it",
    "ES": "es",
    "NL": "nl",
    "SG": "sg",
    "MY": "my",
    "QA": "qa",
    "KW": "kw",
    "BH": "bh",
    "OM": "om",
    "EG": "eg",
    "NG": "ng",
    "ZA": "za",
    "BR": "br",
    "MX": "mx",
    "US": "com",
}


def localized_google_host(country_code: str) -> str:
    tld = COUNTRY_TLD.get((country_code or "").upper())
    return f"google.{tld}" if tld else "google.com"


def build_localized_queries(country: str, category: str, country_code: str = "") -> list[str]:
    category = category.strip()
    country = country.strip()
    primary = f"{category} in {country}"
    queries = [
        primary,
        f"{primary} business website",
        f"{category} companies in {country} contact email",
    ]
    tld = COUNTRY_TLD.get((country_code or "").upper())
    if tld:
        queries.insert(0, f"site:.{tld} {category} in {country}")
    return queries

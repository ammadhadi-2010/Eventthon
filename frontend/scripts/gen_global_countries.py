import json
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "globalCountries.js")

URL = (
    "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/"
    "master/all/all.json"
)


def main():
    with urllib.request.urlopen(URL, timeout=45) as r:
        data = json.loads(r.read().decode())
    rows = [{"code": x["alpha-2"], "name": x["name"]} for x in data if x.get("alpha-2")]
    rows.sort(key=lambda x: x["name"])
    arr = json.dumps(rows, ensure_ascii=False)

    # JS append (no f-string) to avoid \u issues in Python
    js = []
    js.append("/**")
    js.append(" * Global ISO 3166-1 alpha-2 countries (sorted by name).")
    js.append(" * Generated — see scripts/gen_global_countries.py")
    js.append(" */")
    js.append(f"export const GLOBAL_COUNTRIES = {arr};")
    js.append("")
    js.append("/** Unicode regional indicator symbols → flag emoji from ISO alpha-2 */")
    js.append("export function flagEmojiFromIso(isoCode) {")
    js.append("  if (!isoCode || typeof isoCode !== 'string') return '\\uD83C\\uDFF3\\uFE0F';")
    js.append("  const code = isoCode.trim().toUpperCase();")
    js.append("  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return '\\uD83C\\uDFF3\\uFE0F';")
    js.append("  const pts = [...code].map((c) => 127397 + c.charCodeAt(0));")
    js.append("  return String.fromCodePoint(...pts);")
    js.append("}")
    js.append("")
    js.append("export function findCountryByCode(code) {")
    js.append("  if (!code) return undefined;")
    js.append("  const c = String(code).trim().toUpperCase();")
    js.append("  return GLOBAL_COUNTRIES.find((x) => x.code === c);")
    js.append("}")
    body = "\n".join(js) + "\n"

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(body)
    print("Wrote", OUT, len(rows), "countries")


if __name__ == "__main__":
    main()

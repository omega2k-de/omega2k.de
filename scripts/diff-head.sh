#!/usr/bin/env bash

staging_base="https://www.omega2k.de.o2k:4200"
prod_base="https://www.omega2k.de"

paths=(
  "/"
  "/content"
  "/content/a-way-out"
  "/content/beyond-capitalism"
  "/content/beyond-capitalism/chapter01-03"
  "/content/beyond-capitalism/chapter04-06"
  "/content/beyond-capitalism/chapter07-10"
  "/content/beyond-capitalism/chapter11"
  "/content/capitalism-religion"
  "/content/crossroads"
  "/content/injustice"
  "/content/manual-democracy-superorganism"
  "/content/manual-democracy-superorganism/appendix-a"
  "/content/manual-democracy-superorganism/appendix-b"
  "/content/monopoly"
  "/content/renewables"
  "/content/renewables/chapter1"
  "/content/renewables/chapter2"
  "/content/renewables/chapter3"
  "/content/renewables/chapter4"
  "/content/superorganism-2-0"
  "/content/superorganism-2-0/charta-variant-a"
  "/content/superorganism-2-0/charta-variant-b"
  "/content/superorganism-2-0/part-i-reality-shock"
  "/content/superorganism-2-0/part-ii-interpretative-framework"
  "/content/superorganism-2-0/part-iii-regulatory-framework"
  "/content/superorganism-2-0/part-iv-solution-spaces"
  "/content/superorganism-2-0/part-v-self-regulation"
  "/controls"
  "/imprint"
  "/privacy"
)

extract_head_metas() {
  awk 'tolower($0) ~ /<head>/ {inhead=1} inhead {print} tolower($0) ~ /<\/head>/ {inhead=0}' "$1" \
  | grep -Ei '<title|<meta' \
  | grep -Ei 'description|og:title|og:description|og:type|og:url|og:site_name|twitter:card|twitter:title|twitter:description' \
  | grep -Evi 'og:image|twitter:image' \
  | sed 's/^[[:space:]]*//;s/[[:space:]]\+/ /g'
}

for p in "${paths[@]}"; do
  s_html=$(mktemp)
  p_html=$(mktemp)
  curl -s "$staging_base$p" > "$s_html"
  curl -s "$prod_base$p" > "$p_html"
  echo "=== $p ==="
  diff -u \
    <(extract_head_metas "$s_html") \
    <(extract_head_metas "$p_html")
  rm -f "$s_html" "$p_html"
done

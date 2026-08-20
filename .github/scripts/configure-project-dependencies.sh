#!/usr/bin/env bash
# Issue dependencies (blocked by) + roadmap dates/vagues for parallel tracks.
set -eu

REPO="AllAboard-THP/All-Aboard"
PROJECT_ID="PVT_kwDOEMpxOM4BXlc_"
FIELD_VAGUE="PVTSSF_lADOEMpxOM4BXlc_zhSxaWo"
FIELD_START="PVTF_lADOEMpxOM4BXlc_zhSxaXg"
FIELD_END="PVTF_lADOEMpxOM4BXlc_zhSxaZM"

V1="17d10053"
V2="6155b178"
V3="3fb8c7e8"
V4="e28574b5"
V5="932a1d48"

block() {
  local issue="$1" blocker="$2" in="$3" bn="$4"
  gh api graphql -f query="
    mutation {
      addBlockedBy(input: {
        issueId: \"$issue\"
        blockingIssueId: \"$blocker\"
      }) { clientMutationId }
    }" >/dev/null 2>&1 \
    && echo "  #$in blocked by #$bn" \
    || echo "  warn: #$in ← #$bn (maybe exists)"
}

declare -A ITEM_ID

load_item() {
  local n="$1"
  local url="https://github.com/$REPO/issues/$n"
  ITEM_ID[$n]=$(gh project item-list 3 --owner AllAboard-THP --limit 50 --format json 2>/dev/null \
    | jq -r --arg u "$url" '.items[] | select(.content.url==$u) | .id' | head -1)
}

set_vague() { [[ -n "${ITEM_ID[$1]:-}" ]] && gh project item-edit --id "${ITEM_ID[$1]}" --project-id "$PROJECT_ID" --field-id "$FIELD_VAGUE" --single-select-option-id "$2" >/dev/null; }
set_start() { [[ -n "${ITEM_ID[$1]:-}" ]] && gh project item-edit --id "${ITEM_ID[$1]}" --project-id "$PROJECT_ID" --field-id "$FIELD_START" --date "$2" >/dev/null; }
set_end()   { [[ -n "${ITEM_ID[$1]:-}" ]] && gh project item-edit --id "${ITEM_ID[$1]}" --project-id "$PROJECT_ID" --field-id "$FIELD_END" --date "$2" >/dev/null; }

for n in 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36; do
  load_item "$n"
done

echo "=== Dependencies (blocked by) ==="
block I_kwDOSV49KM8AAAABCImB-w I_kwDOSV49KM8AAAABCIlzow 21 18
block I_kwDOSV49KM8AAAABCIl4Zg I_kwDOSV49KM8AAAABCImxFg 19 33
block I_kwDOSV49KM8AAAABCIl8vg I_kwDOSV49KM8AAAABCIl4Zg 20 19
block I_kwDOSV49KM8AAAABCIl8vg I_kwDOSV49KM8AAAABCImB-w 20 21
block I_kwDOSV49KM8AAAABCImGhg I_kwDOSV49KM8AAAABCIl8vg 22 20
block I_kwDOSV49KM8AAAABCImVig I_kwDOSV49KM8AAAABCIl4Zg 26 19
block I_kwDOSV49KM8AAAABCImZcg I_kwDOSV49KM8AAAABCIl8vg 27 20
block I_kwDOSV49KM8AAAABCImZcg I_kwDOSV49KM8AAAABCImB-w 27 21
block I_kwDOSV49KM8AAAABCImcdQ I_kwDOSV49KM8AAAABCImZcg 28 27
block I_kwDOSV49KM8AAAABCImg3g I_kwDOSV49KM8AAAABCImB-w 29 21
block I_kwDOSV49KM8AAAABCIm5MA I_kwDOSV49KM8AAAABCImZcg 35 27
block I_kwDOSV49KM8AAAABCIm8uw I_kwDOSV49KM8AAAABCImZcg 36 27
block I_kwDOSV49KM8AAAABCImLCA I_kwDOSV49KM8AAAABCImZcg 23 27
block I_kwDOSV49KM8AAAABCImRuw I_kwDOSV49KM8AAAABCImOLw 25 24

echo "=== Vagues + dates roadmap ==="
for n in 18 33 31 32; do set_vague "$n" "$V1"; set_start "$n" "2026-05-14"; done
set_end 18 "2026-05-17"
set_end 33 "2026-05-18"
set_end 31 "2026-05-20"
set_end 32 "2026-05-20"

set_vague 24 "$V1"
set_start 24 "2026-05-21"
set_end 24 "2026-06-06"

for n in 21 19; do set_vague "$n" "$V2"; done
set_start 21 "2026-05-18"; set_end 21 "2026-05-22"
set_start 19 "2026-05-19"; set_end 19 "2026-05-24"
set_vague 20 "$V2"; set_start 20 "2026-05-25"; set_end 20 "2026-05-30"
set_vague 22 "$V2"; set_start 22 "2026-06-01"; set_end 22 "2026-06-05"

set_vague 25 "$V3"; set_start 25 "2026-06-07"; set_end 25 "2026-06-12"
set_vague 26 "$V3"; set_start 26 "2026-05-22"; set_end 26 "2026-05-28"
set_vague 30 "$V3"; set_start 30 "2026-05-14"; set_end 30 "2026-05-21"
for n in 27 28 29; do set_vague "$n" "$V3"; done
set_start 27 "2026-06-02"; set_end 27 "2026-06-08"
set_start 28 "2026-06-09"; set_end 28 "2026-06-12"
set_start 29 "2026-06-03"; set_end 29 "2026-06-10"

set_vague 34 "$V4"; set_start 34 "2026-05-20"; set_end 34 "2026-05-24"
set_vague 35 "$V4"; set_start 35 "2026-06-10"; set_end 35 "2026-06-17"

set_vague 23 "$V5"; set_start 23 "2026-06-15"; set_end 23 "2026-06-20"
set_vague 36 "$V5"; set_start 36 "2026-06-15"; set_end 36 "2026-06-22"

echo "Done."

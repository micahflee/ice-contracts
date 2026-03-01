#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CONTRACTORS_SRC="data/dhs_contractors.json"
CONTRACTS_SRC="data/dhs_contracts.json"
OUT_DIR="web/data"

mkdir -p "$OUT_DIR"

echo "Building derived files in $OUT_DIR ..."

jq '
  def norm: ascii_downcase | gsub("[^a-z0-9]"; "");
  map(
    . + {
      normalizedCompanyName: (.companyName | norm),
      popStartYear: (.popStartDate[0:4] | tonumber),
      popEndYear: (.popEndDate[0:4] | tonumber)
    }
  )
' "$CONTRACTS_SRC" > "$OUT_DIR/contracts_enriched.json"

jq '
  def norm: ascii_downcase | gsub("[^a-z0-9]"; "");
  map({
    companyId,
    name,
    normalizedCompanyName: (.name | norm),
    companyURL,
    duns,
    cageCode,
    ueiNumber,
    yearFounded,
    tin,
    companyContact,
    companyPOC
  })
' "$CONTRACTORS_SRC" > "$OUT_DIR/contractors_index.json"

jq -n --slurpfile contractors "$CONTRACTORS_SRC" --slurpfile contracts "$CONTRACTS_SRC" '
  def norm: ascii_downcase | gsub("[^a-z0-9]"; "");

  ($contractors[0]
    | map({
        k: (.name | norm),
        v: {
          companyId,
          name,
          companyURL,
          duns,
          cageCode,
          ueiNumber,
          yearFounded,
          city: .companyContact.city,
          stateCode: (.companyContact.state.name // null),
          stateName: (.companyContact.state.description // null)
        }
      })
    | group_by(.k)
    | map({ key: .[0].k, value: (map(.v) | unique_by(.companyId)) })
    | from_entries
  ) as $contractorIndex

  | ($contracts[0]
    | map(. + { normalizedCompanyName: (.companyName | norm) })
    | group_by(.normalizedCompanyName)
    | map({
        normalizedCompanyName: .[0].normalizedCompanyName,
        companyName: .[0].companyName,
        contractCount: length,
        totalAward: (map(.awardAmount) | add),
        totalObligation: (map(.currentObligationAmount // 0) | add),
        firstStartDate: (map(.popStartDate) | min),
        lastEndDate: (map(.popEndDate) | max),
        programs: (map(.programName) | map(select(. != null and . != "")) | unique | sort),
        awardTypes: (map(.awardType) | map(select(. != null and . != "")) | unique | sort),
        phaseTypes: (map(.phaseType) | map(select(. != null and . != "")) | unique | sort),
        states: (map(.companyStateCd) | map(select(. != null and . != "")) | unique | sort),
        contractIds: (map(.awardId) | sort),
        sampleProposalTitles: (map(.proposalTitle) | unique | .[0:3]),
        matchStatus: (if ($contractorIndex[.[0].normalizedCompanyName] // null) == null then "unmatched" else "matched" end),
        matchedContractors: ($contractorIndex[.[0].normalizedCompanyName] // [])
      })
    | sort_by(-.totalAward)
  )
' > "$OUT_DIR/company_rollups.json"

jq '
  map(select(.companyStateCd != null and .companyStateCd != ""))
  | group_by(.companyStateCd)
  | map({
      stateCode: .[0].companyStateCd,
      stateName: .[0].companyState,
      contractCount: length,
      totalAward: (map(.awardAmount) | add),
      totalObligation: (map(.currentObligationAmount // 0) | add)
    })
  | sort_by(-.totalAward)
' "$CONTRACTS_SRC" > "$OUT_DIR/state_rollups.json"

jq -n --slurpfile contractors "$CONTRACTORS_SRC" --slurpfile contracts "$CONTRACTS_SRC" --slurpfile companies "$OUT_DIR/company_rollups.json" '
  {
    contractors_rows: ($contractors[0] | length),
    contracts_rows: ($contracts[0] | length),
    unique_contract_companies: ($contracts[0] | map(.companyName) | unique | length),
    company_rollups_rows: ($companies[0] | length),
    matched_company_rollups: ($companies[0] | map(select(.matchStatus == "matched")) | length),
    unmatched_company_rollups: ($companies[0] | map(select(.matchStatus == "unmatched")) | length),
    total_award_amount: ($contracts[0] | map(.awardAmount) | add),
    total_obligation_amount: ($contracts[0] | map(.currentObligationAmount // 0) | add),
    pop_start_min: ($contracts[0] | map(.popStartDate) | min),
    pop_start_max: ($contracts[0] | map(.popStartDate) | max)
  }
' > "$OUT_DIR/summary_metrics.json"

echo "Done. Wrote derived data to $OUT_DIR"
# ICE Contracts

Data visualization of ICE contactors and contract data [published](https://ddosecrets.org/article/ice-contracts) by DDoSecrets on March 1, 2023. The data was hacked from DHS' Office of Industry Partnership and leaked by a group calling themselves the Department of Peace.

## Static Data Explorer (MVP)

This repo now includes a simple static website for exploring DHS contractor and contract data with search, filters, rankings, and a state-level map.

### 1) Build derived web data

Run:

```bash
./scripts/build_derived_data.sh
```

This writes preprocessed files to `web/data/`:

- `contracts_enriched.json`
- `contractors_index.json`
- `company_rollups.json`
- `state_rollups.json`
- `summary_metrics.json`

### 2) Serve the static site

From the repo root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/web/`

### Notes

- Contractor-to-contract links are inferred by normalized company name matching.
- The map is state-level (not street-level geocoding) and uses available state fields in contracts.

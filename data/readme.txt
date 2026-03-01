For your convenience, this file contains example commands that can be used parse through the data.
 ___________
|CONTRACTORS|
Search for contractors by partial name:
cat dhs_contractors.json | jq '.[] | select(.name | test("Palantir"))'

Find contractor by exact name:
cat dhs_contractors.json | jq '.[] | select(.name == "Palantir Technologies Inc.")'

Get contractor URLs:
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .companyURL' | grep -v '^null$' | sort -u

Get contractor email addresses:
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .companyPOC.email' | grep -v '^null$' | sort -u
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .companyContact.email' | grep -v '^null$' | sort -u

Get contractor phone numbers:
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .companyPOC.phoneNumber' | grep -v '^null$' | sort -u
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .companyContact.phoneNumber' | grep -v '^null$' | sort -u

Get contractor tax IDs:
cat dhs_contractors.json | jq -r '.[] | select(.name | test("Raytheon")) | .tin' | grep -v '^null$' | sort -u

Get all contractor company names:
cat dhs_contractors.json | jq -r '.[].name' | sort -u

Get all contractor URLs:
cat dhs_contractors.json | jq -r '.[].companyURL' | grep -v '^null$' | sort -u

 _________
|CONTRACTS|
Get names of all companies who won a contract:
cat dhs_contracts.json | jq -r '.[].companyName' | sort -u

Get proposal titles by partial company name:
cat dhs_contracts.json | jq -r '.[] | select(.companyName | test("AI")) | .proposalTitle'

Get company names by partial proposal titles:
cat dhs_contracts.json | jq -r '.[] | select(.proposalTitle | test("Surveillance")) | .companyName' | sort -u

Get proposal abstracts by partial company name:
cat dhs_contracts.json | jq -r '.[] | select(.companyName | test("PercepTek")) | .proposalAbstract'

Get proposal titles by keyword:
cat dhs_contracts.json | jq -r '.[].proposalTitle' | grep Biometric

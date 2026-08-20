#!/usr/bin/env bash
# Configure GitHub Project Status field — 6 columns (Hermes Kanban-aligned).
# Usage: gh auth switch (account with project scope) && ./configure-project-status.sh
set -eu

OWNER="AllAboard-THP"
PROJECT_NUM=3
PROJECT_ID="PVT_kwDOEMpxOM4BXlc_"
FIELD_STATUS="PVTSSF_lADOEMpxOM4BXlc_zhSxU5c"

# Preserve GitHub default option IDs for Todo / In Progress / Done when re-running.
gh api graphql -f query='
mutation {
  updateProjectV2Field(input: {
    fieldId: "PVTSSF_lADOEMpxOM4BXlc_zhSxU5c"
    singleSelectOptions: [
      { name: "Triage", color: GRAY, description: "Idées brutes — à spécifier avant dev" }
      { id: "f75ad846", name: "Todo", color: BLUE, description: "Spécifié — en attente de dépendances ou non assigné" }
      { name: "Ready", color: YELLOW, description: "Assigné — prêt à être pris en charge" }
      { id: "47fc9ee4", name: "In Progress", color: ORANGE, description: "En cours — dev actif sur la branche" }
      { name: "Blocked", color: RED, description: "Bloqué — besoin humain (review, décision, accès)" }
      { id: "98236657", name: "Done", color: GREEN, description: "Terminé — mergé ou livré" }
    ]
  }) {
    projectV2Field {
      ... on ProjectV2SingleSelectField {
        options { id name color description }
      }
    }
  }
}' | jq '.data.updateProjectV2Field.projectV2Field.options'

echo "Status field updated on project $OWNER #$PROJECT_NUM"

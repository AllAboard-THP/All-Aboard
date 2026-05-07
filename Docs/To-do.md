# To-do

## Priorite immediate

- [ ] Ajouter un mode maintenance active par variable d'environnement
      (`MAINTENANCE_MODE=true`) dans `apps/web` pour afficher la page "Site en
      construction" sans creer une app separee.
- [ ] Definir un comportement clair:
      - `MAINTENANCE_MODE=true` -> page statique "Site en construction".
      - `MAINTENANCE_MODE=false` -> retour a la page produit normale.
- [ ] Documenter la variable dans `.env.example` et dans le `README.md`.
- [ ] Valider le rendu en environnement local et en preproduction.

# Skills Audit — V4 Product-Fit Upgrade

This report evaluates each skill from the perspective of repeated execution on the vibe-coding workspace product.

## 1) brief-to-spec
### v3 score
9.6/10

### v3 weaknesses
- strong generic structure, but not sufficiently anchored to this product's entity model and deployment truth requirements
- did not force explicit repo-bootstrap/deploy/preview contracts in every output

### v4 upgrades
- tied output to the vibe-workspace entity model and three-column operator layout
- added product-specific defaults and anti-patterns
- strengthened acceptance criteria around provider selection, repo bootstrap, deploy truth, and preview truth
- added a phase-aware spec template

### v4 target score
9.9/10

## 2) github-railway-bootstrap
### v3 score
9.5/10

### v3 weaknesses
- good state-machine, but still too infra-only
- did not force the UI contract for provisioning truth strongly enough

### v4 upgrades
- added explicit requested-vs-observed-state model
- added idempotency and failure matrix tuned to project-level repo bootstrap and Railway linkage
- added environment contract and UI truth rules for right-pane deploy state

### v4 target score
9.9/10

## 3) parallel-execution
### v3 score
9.2/10

### v3 weaknesses
- correct but still too permissive for a product with tightly coupled schema, UI, and integration state
- did not explicitly ban parallel work when a single migration or shared contract can break multiple surfaces

### v4 upgrades
- added stronger no-go criteria for shared state changes
- added worktree playbook and merge discipline focused on this product's vertical slices
- added explicit split examples that are safe versus unsafe

### v4 target score
9.7/10

## 4) phase-planner
### v3 score
9.4/10

### v3 weaknesses
- lacked a product-specific phase map
- did not force infra-risk to be isolated from first-time UI + data + deployment changes strongly enough

### v4 upgrades
- added product phase map and risk budget
- embedded exact recommended slice order for this workspace product
- added regression surface awareness per phase

### v4 target score
9.8/10

## 5) repo-safety
### v3 score
9.5/10

### v3 weaknesses
- still depended too much on general policy language for Bash discipline
- lacked product-specific no-touch zones beyond `.claude/**`

### v4 upgrades
- strengthened forbidden mutating Bash patterns
- clarified no-touch zones around schema, auth, repo-bootstrap state, and deploy-state contracts unless in-scope
- added change-surface classification template

### v4 target score
9.9/10

## 6) ui-workspace-standards
### v3 score
9.4/10

### v3 weaknesses
- needed stronger product-specific guidance on the left rails, center workspace, and right operational pane
- review language was good but not strict enough about fake preview/deploy truth

### v4 upgrades
- codified the exact three-column layout for this product
- added operator-console review checklist and empty-state/failure-state expectations
- made right-pane truth and task-centered interaction explicit

### v4 target score
9.9/10

## 7) validation-gate
### v3 score
9.7/10

### v3 weaknesses
- good execution pattern, but not anchored enough to this product's critical path

### v4 upgrades
- aligned checklist and verdict to the real critical user flows
- tightened pass/fail logic for repo bootstrap, deploy truth, and preview truth claims
- preserved manual isolated execution so it does not self-trigger in the wrong context

### v4 target score
9.9/10

## 8) vertical-slice-delivery
### v3 score
9.4/10

### v3 weaknesses
- needed a more explicit slice definition for this product
- could better enforce proving product model before polish

### v4 upgrades
- added slice template tied to this workspace product
- added ordering heuristics specific to projects/folders/tasks/chat/attachments/providers/bootstrap/deploy
- strengthened "prove the model first" language

### v4 target score
9.8/10

## Overall v4 judgment
The skills are now designed to be:
- product-specific
- reusable across phases
- harder to misuse
- better at constraining scope and false-completeness

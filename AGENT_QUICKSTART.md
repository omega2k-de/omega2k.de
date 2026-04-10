# Agent Quickstart

This is the shortest safe path for a follow-up agent.

## 1. Sync local state

```bash
git fetch origin
git switch main
git merge --ff-only origin/main
```

Never continue from an old feature branch after a merge.

## 2. Read only these files first

- `AGENTS.md`
- `README.md`
- `TASKS.md`
- `AGENTIC_CODING.md`
- `TESTING.md`

Only open deeper docs when the current task needs them.

Handshake:

- do not emit `AGENT_OK` before reading `AGENTS.md`, `README.md`, `TASKS.md`, `AGENTIC_CODING.md`, and `TESTING.md`
- no other meaningful text may appear before `AGENT_OK`
- if the user has not given a concrete task yet, reply with exactly `AGENT_OK`
- if the user already gave a concrete task, make the first line exactly `AGENT_OK`
- only after that continue with the actual work update
- `AGENT_OK` only confirms that repo-local instructions were seen

## 3. Start a slice

```bash
./scripts/specify-feature.sh "short feature description"
```

Rules:

- one small slice per branch
- never commit directly to `main`
- use branch names `feat/<scope>-<short-kebab>` or `fix/<scope>-<short-kebab>`
- use commit/MR titles `feat(scope): <message>` or `fix(scope): <message>`
- keep changed code files at or below 200 lines when possible
- update `TASKS.md` and `spec-kit/specs/roadmap.delivery.spec.md` in the same slice
- the same workflow rules apply to this repository and to the runtime/workflow logic it defines
- prefer `AGENT_QUICKSTART.md` as the single compact MR/pipeline operator guide

## 4. Standard local verification

Prefer targeted tests first:

```bash
make test
```

If an MR pipeline fails, inspect the failed pipeline before editing:

```bash
gitlab/tool.sh mr status --mr-iid <iid>
gitlab/tool.sh pipeline jobs --pipeline-id <pipeline_id>
gitlab/tool.sh pipeline inspect --pipeline-id <pipeline_id>
```

Common failure pattern in this repo:

- `fixture 'self' not found` or `NameError: name 'self' is not defined`
- this means a pytest function still uses `self` or unittest-style assertions
- fix by moving reusable logic to helpers and keeping unittest/pytest wrappers cleanly separated

## 5. GitLab helper commands

Create MR:

```bash
git push -u origin <branch>
sleep 5
gitlab/tool.sh mr create --source-branch <branch> --target-branch main --title "<title>"
```

Check MR and pipeline:

```bash
gitlab/tool.sh mr status --mr-iid <iid>
gitlab/tool.sh mr auto-merge --mr-iid <iid>
gitlab/tool.sh mr wait --mr-iid <iid>
```

Pipelines are expected to run from merge requests and from the default branch after merge, not from plain feature-branch pushes.

## 6. After merge

```bash
git fetch origin
git switch main
git merge --ff-only origin/main
```

Then start the next branch from updated `main`.

## 7. If you are unsure

- Use `TASKS.md` for the latest stable baseline and next likely slices
- Use `AGENT_QUICKSTART.md` for the compact MR and pipeline operator flow
- Use `TESTING.md` for the current CLI and IDE test entrypoints
- Prefer a smaller MR over a broader one
- Do not study `gitlab/tool.sh` internals unless the helper itself is broken

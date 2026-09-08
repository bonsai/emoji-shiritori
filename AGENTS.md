# AGENTS.md

## Development standard

This repository uses Issue Driven Development (IDD).

### Before implementation
1. Identify the target GitHub Issue.
2. Read the Issue and confirm purpose, constraints, design, acceptance criteria, and dependencies.
3. Check the ontology and existing implementation before making assumptions.
4. Do not silently change requirements. Record specification changes in the Issue.

### Implementation
1. Implement only what is defined by the Issue unless a small corrective change is required.
2. Keep design decisions in GitHub Issues; keep the repository focused on code, data, tests, and runtime configuration.
3. Prefer small, reviewable changes.
4. Preserve existing behavior unless the Issue explicitly changes it.

### Verification
1. Run the relevant tests and build when available.
2. Check the resulting diff for unintended changes.
3. Report verification results honestly, including anything that could not be run.

### Completion
1. Commit with a message describing the change.
2. Reference the Issue in the commit or PR when possible.
3. Update the Issue with implementation findings, verification results, and remaining work.
4. Close the Issue only when its acceptance criteria are satisfied.

## Source-of-truth hierarchy

Issue / Issue decisions -> Wiki ontology reference -> existing code -> agent judgment.

When sources conflict, stop and surface the conflict rather than inventing a new requirement.

## Core principle

**Issue = design and intent. Repository = implementation. Agent = executor of the defined work.**

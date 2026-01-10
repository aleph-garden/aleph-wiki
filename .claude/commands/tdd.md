---
name: tdd
description: TDD workflow using two agents - one writes failing tests, another implements code to pass them
---

# TDD Dual-Agent Workflow

Execute TDD using two specialized agents working in sequence:

1. **Test Agent**: Writes failing tests following TDD principles
2. **Implementation Agent**: Makes tests pass with minimal code

## Usage

When user runs `/tdd [feature description]`:

### Phase 1: RED - Write Failing Test

1. **Announce what you're doing**:
   ```
   Starting TDD cycle for: [feature description]

   Phase 1 (RED): Writing failing test
   Launching Test Agent...
   ```

2. **Launch Test Agent** with Task tool:
   - Agent type: `general-purpose`
   - Task: Write failing test for `[feature description]`
   - Requirements:
     * Write ONE minimal test showing desired behavior
     * Test must fail (watch it fail with `npm test`)
     * Verify failure is for right reason (missing feature, not syntax error)
     * Use clear test name describing behavior
     * No mocks unless absolutely necessary
     * Stop after test verified failing - DO NOT implement

3. **After Test Agent completes**, show summary:
   ```
   Phase 1 (RED) complete:
   - Test written: [test file path:line_number]
   - Test name: [describe block and test name]
   - Verified failing: [yes/no with error message]

   Ready to proceed to implementation? (yes/no/show me the test)
   ```

4. **Wait for user confirmation** before proceeding

### Phase 2: GREEN - Make Test Pass

5. **After user confirms**, announce:
   ```
   Phase 2 (GREEN): Implementing minimal code to pass test
   Launching Implementation Agent...
   ```

6. **Launch Implementation Agent** with Task tool:
   - Agent type: `general-purpose`
   - Task: Implement minimal code to pass the failing test at [test file path]
   - Requirements:
     * Write simplest code to make test pass
     * Run tests to verify all pass
     * No extra features beyond what test requires
     * Refactor only after green
     * Report what was implemented and where

7. **After Implementation Agent completes**, show summary:
   ```
   Phase 2 (GREEN) complete:
   - Implementation: [file path:line_number]
   - All tests passing: [yes/no with output]
   - Code changes: [brief description]

   Ready for next TDD cycle? (yes/no/show me the code)
   ```

8. **Wait for user decision** on next steps

## Test Framework Setup

If no test framework exists:
1. Ask user which framework (Jest, Vitest, etc.)
2. Set up minimal config
3. Create first test file
4. **Wait for user confirmation** before writing first test

## Cycle Continuation

After each complete RED-GREEN cycle:
- Show clear summary of what was accomplished
- Ask user for next action:
  * Continue with next test (describe what behavior to test next)
  * Refactor current code
  * Stop and review
- Keep tests small and focused
- One behavior per test

## Example Flow

User: `/tdd add user authentication`

You respond:
```
Starting TDD cycle for: add user authentication

Phase 1 (RED): Writing failing test
Launching Test Agent...
```

[Agent 1 writes test, verifies it fails]

You then show:
```
Phase 1 (RED) complete:
- Test written: test/auth.test.ts:15
- Test name: "should authenticate user with valid credentials"
- Verified failing: yes - Error: authenticate is not defined

Ready to proceed to implementation? (yes/no/show me the test)
```

User: `yes`

You respond:
```
Phase 2 (GREEN): Implementing minimal code to pass test
Launching Implementation Agent...
```

[Agent 2 implements minimal code, verifies test passes]

You then show:
```
Phase 2 (GREEN) complete:
- Implementation: src/auth.ts:1
- All tests passing: yes
- Code changes: Added authenticate() function that validates credentials

Ready for next TDD cycle? (yes/no/show me the code)
```

## Important Rules

- NEVER write code before test fails
- NEVER write tests and implementation in same agent
- NEVER skip verification steps
- NEVER proceed to next phase without user confirmation
- Test agents MUST stop after RED verification
- Implementation agents MUST start with failing test
- ALWAYS show summaries with file paths and line numbers
- ALWAYS wait for user input between phases

## Accountability & Transparency

**You MUST provide visibility at every step:**

1. **Before launching agent**: Announce phase and what will happen
2. **After agent completes**: Show concrete summary with:
   - File paths and line numbers (e.g., `src/auth.ts:15`)
   - What was done (test name, function implemented, etc.)
   - Verification results (test output, pass/fail status)
3. **Between phases**: Wait for explicit user confirmation
4. **Never batch**: One phase at a time, one decision at a time

**If user says "show me the test" or "show me the code":**
- Use Read tool to display the relevant file sections
- Highlight the specific changes made
- Then ask again if they want to proceed

Follow `.conventional-commits.md` for any commits.

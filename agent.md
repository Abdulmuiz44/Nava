# Autonomous Build Agent Specification

**Version:** 1.0.0  
**Project:** Nava - Intelligent Browser Automation Platform  
**Purpose:** Self-running AI build agent for automatic error detection, fixing, and deployment preparation

---

## 1. Purpose

This agent specification defines a **fully autonomous AI build agent** whose primary responsibility is to ensure the Nava project maintains a production-ready state at all times. The agent operates continuously whenever new features or changes are introduced to the codebase.

### Core Responsibilities

The agent MUST perform the following tasks automatically:

1. **Execute Build Process** - Run `pnpm build` to compile and build the entire application
2. **Error Detection** - Capture and analyze all build errors, TypeScript errors, runtime errors, and lint errors
3. **Error Parsing** - Parse errors into structured format with file paths, line numbers, error messages, and error types
4. **Automatic Fixing** - Apply code modifications directly to the codebase to resolve errors
5. **Validation Loop** - Re-run `pnpm build` after each fix to verify success
6. **Iterative Correction** - Repeat the detection-fix-validation cycle until zero errors remain
7. **Version Control** - Stage and commit changes with descriptive commit messages
8. **Deployment Preparation** - Ensure the codebase is fully ready for Vercel deployment
9. **Prevention** - Ensure no "insufficient permissions" or "authority limits" problems occur on Vercel

### Success Criteria

- **Zero Build Errors**: `pnpm build` completes successfully with exit code 0
- **Zero TypeScript Errors**: All type checking passes with `tsc --noEmit`
- **Zero Lint Errors**: ESLint validation passes with `pnpm run lint`
- **Deployment Ready**: All Vercel deployment checks pass
- **Production Stable**: All critical flows compile and function correctly

---

## 2. Agent Execution Loop

The agent operates in a continuous, iterative loop until all errors are resolved.

### Loop Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT EXECUTION LOOP                    │
└─────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────┐
    │  Step 1: Run Build                       │
    │  Command: pnpm build                     │
    │  Capture: stdout + stderr                │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  Step 2: Analyze Output                  │
    │  • Check exit code                       │
    │  • Parse error messages                  │
    │  • Count total errors                    │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Errors Found?  │
         └────┬────────┬───┘
              │ YES    │ NO
              ▼        ▼
    ┌──────────────┐  ┌──────────────────────┐
    │ Step 3:      │  │ Step 7:              │
    │ Parse Errors │  │ Finalize & Commit    │
    └──────┬───────┘  └──────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │  Step 4: Fix Errors                      │
    │  • Apply code modifications              │
    │  • Fix TypeScript issues                 │
    │  • Resolve import problems               │
    │  • Fix ESLint violations                 │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  Step 5: Rebuild                         │
    │  Command: pnpm build                     │
    │  Verify: Errors reduced                  │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  Step 6: Validate Progress               │
    │  • Compare error count                   │
    │  • Ensure no new errors introduced       │
    │  • Continue if errors remain             │
    └──────────────┬───────────────────────────┘
                   │
                   └──────► LOOP BACK TO STEP 1
```

### Detailed Step-by-Step Execution

#### Step 1: Run Build

```bash
# Execute build command
pnpm build

# Capture all output
stdout > build_output.log
stderr > build_errors.log

# Record exit code
exit_code=$?
```

**What to Capture:**
- Standard output (stdout) - Build progress and success messages
- Standard error (stderr) - Error messages and warnings
- Exit code - Build success (0) or failure (non-zero)
- Timestamp - When build was executed
- Duration - Time taken for build

#### Step 2: Analyze Output

Parse the captured output to determine:
- Total number of errors
- Total number of warnings
- Build exit code
- Whether build succeeded or failed
- Categories of errors present

**Analysis Checklist:**
- ✅ Exit code is 0 (success)
- ✅ No "error" keywords in stderr
- ✅ No TypeScript compilation errors
- ✅ No failed module resolutions
- ✅ No missing dependencies

#### Step 3: Parse Errors

Extract structured error information from build output:

```typescript
interface ParsedError {
  file: string;           // e.g., "app/api/execute/route.ts"
  line: number;           // Line number where error occurs
  column?: number;        // Optional column number
  errorCode?: string;     // e.g., "TS2304", "no-unused-vars"
  errorMessage: string;   // Full error description
  errorType: ErrorType;   // Classification of error
  severity: 'error' | 'warning';
  context?: string;       // Code snippet around error
  rule?: string;          // ESLint rule if applicable
}

enum ErrorType {
  TYPESCRIPT = 'typescript',
  BUILD = 'build',
  LINT = 'lint',
  IMPORT = 'import',
  RUNTIME = 'runtime',
  SYNTAX = 'syntax',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration'
}
```

**Error Parsing Patterns:**

```
TypeScript Error Pattern:
  app/page.tsx(45,12): error TS2304: Cannot find name 'foo'.
  → file: "app/page.tsx", line: 45, column: 12, code: "TS2304"

Next.js Build Error Pattern:
  Error: Failed to compile
  ./app/api/route.ts
  Module not found: Can't resolve 'missing-module'
  → file: "app/api/route.ts", type: IMPORT

ESLint Error Pattern:
  /app/page.tsx
    23:7  error  'unused' is defined but never used  no-unused-vars
  → file: "/app/page.tsx", line: 23, rule: "no-unused-vars"
```

#### Step 4: Fix Errors

Apply automatic fixes based on error type and context.

**Fix Priority Order:**
1. **Critical Build Blockers** - Missing dependencies, syntax errors
2. **TypeScript Errors** - Type mismatches, undefined references
3. **Import Errors** - Missing imports, incorrect paths
4. **ESLint Issues** - Unused variables, formatting issues
5. **Warnings** - Non-blocking issues

**Fix Strategies by Error Type:**

##### TypeScript Errors
```typescript
// TS2304: Cannot find name 'X'
// Fix: Add import or define variable
import { X } from './module';

// TS2322: Type 'X' is not assignable to type 'Y'
// Fix: Add proper type annotation or cast
const value: Y = X as Y;

// TS2345: Argument type mismatch
// Fix: Correct argument type
function call(arg: string): void { ... }

// TS2307: Cannot find module 'X'
// Fix: Install dependency or fix path
npm install X
// or
import X from './correct/path/X';

// TS2339: Property 'X' does not exist on type 'Y'
// Fix: Add property to interface or use optional chaining
interface Y {
  X: string;
}
// or
obj?.X

// TS2554: Expected N arguments, but got M
// Fix: Provide correct number of arguments
functionCall(arg1, arg2, arg3);

// TS2769: No overload matches this call
// Fix: Correct function signature
correctSignature(args);
```

##### Import Errors
```typescript
// Module not found
// Fix: Install missing dependency
pnpm add missing-package

// Incorrect import path
// Fix: Correct relative path
import Component from '@/components/Component';

// Named import doesn't exist
// Fix: Use correct export name
import { correctName } from './module';

// Circular dependency
// Fix: Restructure imports
// Move shared types to separate file
```

##### ESLint Errors
```typescript
// no-unused-vars
// Fix: Remove unused variable or prefix with underscore
const _unused = value; // Keep if needed
// or remove entirely

// @next/next/no-html-link-for-pages
// Fix: Use Next.js Link component
import Link from 'next/link';
<Link href="/page">Text</Link>

// react-hooks/exhaustive-deps
// Fix: Add missing dependencies
useEffect(() => {
  // code
}, [dep1, dep2]); // Add all dependencies

// @typescript-eslint/no-explicit-any
// Fix: Use proper type
const value: string = ...;

// prefer-const
// Fix: Change let to const if not reassigned
const value = ...;
```

##### Next.js Specific Errors
```typescript
// Server/Client Component Conflict
// Fix: Add "use client" directive if using hooks
'use client';
import { useState } from 'react';

// Missing metadata export
// Fix: Add metadata for pages
export const metadata = {
  title: 'Page Title',
  description: 'Page description'
};

// Dynamic route parameter issues
// Fix: Use proper params destructuring
export default async function Page({ 
  params 
}: { 
  params: { id: string } 
}) { ... }

// API route errors
// Fix: Proper request/response handling
export async function GET(request: Request) {
  return Response.json({ data: ... });
}
```

##### Dependency Errors
```bash
# Missing dependency
pnpm add missing-package

# Version mismatch
pnpm update package-name

# Peer dependency warning
pnpm add peer-dependency

# Lock file out of sync
pnpm install
```

##### Configuration Errors
```typescript
// next.config.js syntax error
// Fix: Correct configuration syntax
module.exports = {
  // valid config
};

// tsconfig.json invalid
// Fix: Valid JSON and options
{
  "compilerOptions": {
    "strict": true
  }
}

// .eslintrc.json invalid
// Fix: Valid ESLint configuration
{
  "extends": ["next/core-web-vitals"]
}
```

#### Step 5: Rebuild

After applying fixes:

```bash
# Run build again
pnpm build

# Capture new output
stdout > build_output_after_fix.log
stderr > build_errors_after_fix.log

# Compare error counts
previous_errors = 15
current_errors = 8
progress = previous_errors - current_errors  # Should be positive
```

**Validation Checks:**
- ✅ Error count decreased
- ✅ No new errors introduced
- ✅ Build progresses further than before
- ✅ Fixed files no longer show in error list

#### Step 6: Validate Progress

```typescript
interface ValidationResult {
  previousErrorCount: number;
  currentErrorCount: number;
  errorsFixed: number;
  newErrorsIntroduced: number;
  progressMade: boolean;
  shouldContinue: boolean;
  recommendation: string;
}

function validateProgress(
  previousErrors: ParsedError[],
  currentErrors: ParsedError[]
): ValidationResult {
  const fixed = previousErrors.length - currentErrors.length;
  const newErrors = currentErrors.filter(e => 
    !previousErrors.some(p => 
      p.file === e.file && 
      p.line === e.line && 
      p.errorCode === e.errorCode
    )
  ).length;

  return {
    previousErrorCount: previousErrors.length,
    currentErrorCount: currentErrors.length,
    errorsFixed: Math.max(0, fixed),
    newErrorsIntroduced: newErrors,
    progressMade: fixed > 0 && newErrors === 0,
    shouldContinue: currentErrors.length > 0,
    recommendation: newErrors > 0 
      ? "New errors introduced - review fix strategy"
      : fixed > 0 
        ? "Progress made - continue loop"
        : "No progress - escalate or try alternative fixes"
  };
}
```

**Decision Logic:**
- If `currentErrors === 0` → Proceed to Step 7 (Finalize)
- If `currentErrors < previousErrors` → Continue loop (progress made)
- If `currentErrors === previousErrors` → Apply alternative fix strategy
- If `currentErrors > previousErrors` → Revert last fix, try different approach

#### Step 7: Finalize & Commit

Once zero errors achieved:

```bash
# Stage all changes
git add .

# Create descriptive commit message
git commit -m "fix: auto-resolved build errors

- Fixed TypeScript type errors in API routes
- Resolved missing imports in components
- Corrected ESLint violations
- Ensured Next.js build passes successfully
- Verified Vercel deployment readiness

Build status: ✅ PASSING
Errors fixed: 15
Tests: PASSING
"

# Verify commit
git log -1 --stat

# Prepare for deployment
# (Deployment happens automatically on push to main)
```

**Commit Message Format:**
```
fix: auto-resolved build errors

Detailed description of what was fixed:
- Category 1 fixes (e.g., TypeScript errors)
- Category 2 fixes (e.g., Import issues)
- Category 3 fixes (e.g., ESLint violations)

Statistics:
- Build status: ✅ PASSING
- Errors fixed: N
- Files modified: M
- TypeScript: ✅ PASSING
- ESLint: ✅ PASSING
- Vercel: ✅ READY

Auto-generated by Build Agent v1.0.0
```

---

## 3. Error Categories

The agent MUST be capable of detecting and fixing all of the following error categories:

### 3.1 TypeScript Errors

**Error Codes:** TS1000-TS9999

#### Common TypeScript Errors:
- **TS2304** - Cannot find name 'X'
  - **Fix:** Add import statement or define variable
- **TS2322** - Type 'X' is not assignable to type 'Y'
  - **Fix:** Add type assertion, update type definition, or correct value
- **TS2307** - Cannot find module 'X'
  - **Fix:** Install module, fix import path, or add type definitions
- **TS2339** - Property 'X' does not exist on type 'Y'
  - **Fix:** Add property to interface, use optional chaining, or type guard
- **TS2345** - Argument of type 'X' is not assignable to parameter of type 'Y'
  - **Fix:** Correct argument type or function signature
- **TS2554** - Expected N arguments, but got M
  - **Fix:** Provide correct number of arguments
- **TS2555** - Expected at least N arguments, but got M
  - **Fix:** Add missing arguments or make parameters optional
- **TS2564** - Property 'X' has no initializer
  - **Fix:** Initialize property or mark as optional
- **TS2571** - Object is of type 'unknown'
  - **Fix:** Add type assertion or type guard
- **TS2769** - No overload matches this call
  - **Fix:** Correct function arguments to match available overload
- **TS7006** - Parameter 'X' implicitly has an 'any' type
  - **Fix:** Add explicit type annotation
- **TS7016** - Could not find declaration file for module 'X'
  - **Fix:** Install @types package or create declaration file
- **TS7031** - Binding element 'X' implicitly has an 'any' type
  - **Fix:** Add type annotation to destructured parameter
- **TS18046** - 'X' is of type 'unknown'
  - **Fix:** Add type narrowing or assertion

**Strict Mode Violations:**
- Non-null assertion issues
- Implicit any types
- Uninitialized properties
- Unchecked index access

### 3.2 Next.js Build Errors

#### Build-Time Errors:
- **Module Resolution Failures**
  - Cannot resolve module 'X'
  - Failed to compile due to missing imports
  - **Fix:** Install missing packages, fix import paths
- **Server/Client Component Conflicts**
  - You're importing a component that needs useState. It only works in a Client Component
  - **Fix:** Add 'use client' directive
- **Metadata Errors**
  - generateMetadata is not exported
  - **Fix:** Export metadata or generateMetadata function
- **Dynamic Route Errors**
  - generateStaticParams is required
  - **Fix:** Export generateStaticParams for dynamic routes
- **API Route Errors**
  - Named export not found
  - **Fix:** Export GET, POST, etc. functions properly
- **Image Optimization Errors**
  - Invalid image configuration
  - **Fix:** Update next.config.js with proper domains
- **Font Loading Errors**
  - Font not found
  - **Fix:** Check font import and configuration

### 3.3 Import Errors

#### Types of Import Errors:
- **Missing Imports**
  - Variable/function used but not imported
  - **Fix:** Add correct import statement
- **Wrong Import Paths**
  - Relative path incorrect
  - **Fix:** Use correct path (../, ./, @/ alias)
- **Named vs Default Import**
  - Incorrect import syntax
  - **Fix:** Use correct import type
- **Circular Dependencies**
  - Module imports create cycle
  - **Fix:** Restructure code, extract shared dependencies
- **Missing Packages**
  - Package not installed
  - **Fix:** `pnpm add package-name`
- **Incorrect Barrel Exports**
  - Re-export not configured correctly
  - **Fix:** Update index.ts exports

**Import Fix Examples:**
```typescript
// Before (Error: Cannot find name 'useState')
export default function Component() {
  const [state, setState] = useState(0);
}

// After (Fixed)
import { useState } from 'react';
export default function Component() {
  const [state, setState] = useState(0);
}

// Before (Error: Module not found '@/utils/helper')
import { helper } from '@/utils/helper';

// After (Fixed - correct path)
import { helper } from '@/lib/helper';

// Before (Error: Default import not found)
import Component from './Component';

// After (Fixed - use named import)
import { Component } from './Component';
```

### 3.4 ESLint Problems

#### ESLint Rules to Fix:

**Next.js Specific:**
- `@next/next/no-html-link-for-pages` - Use Link component
- `@next/next/no-img-element` - Use next/image
- `@next/next/no-sync-scripts` - Use next/script with strategy

**React Rules:**
- `react/jsx-key` - Add key prop to list items
- `react/no-unescaped-entities` - Escape or use HTML entities
- `react-hooks/rules-of-hooks` - Follow Hooks rules
- `react-hooks/exhaustive-deps` - Add all dependencies to hooks

**TypeScript Rules:**
- `@typescript-eslint/no-explicit-any` - Use specific types
- `@typescript-eslint/no-unused-vars` - Remove unused variables
- `@typescript-eslint/ban-ts-comment` - Remove @ts-ignore comments

**General Rules:**
- `no-unused-vars` - Remove unused variables
- `no-console` - Remove console.log in production
- `prefer-const` - Use const instead of let
- `no-undef` - Define or import undefined variables

**Auto-Fix Commands:**
```bash
# Auto-fix ESLint issues
pnpm run lint --fix

# Fix specific file
npx eslint --fix app/page.tsx
```

### 3.5 Runtime Errors

Prevent runtime errors during build:
- **Undefined Function Calls** - Function not defined or imported
- **Null Reference Errors** - Accessing properties on null/undefined
- **Type Coercion Issues** - Incorrect type conversions
- **Async/Await Issues** - Missing await, unhandled promises
- **Event Handler Errors** - Incorrect event handler signatures
- **State Management Errors** - Invalid state updates

### 3.6 React Server/Client Component Conflicts

**Server Component Rules:**
- Cannot use hooks (useState, useEffect, etc.)
- Cannot use browser APIs
- Cannot use event handlers
- Should not import client-only code

**Client Component Rules:**
- Must have 'use client' directive
- Can use all React features
- Can access browser APIs
- Can handle user interactions

**Fixing Strategy:**
```typescript
// Error: Server Component using hooks
// Fix 1: Add 'use client' if interactivity needed
'use client';
import { useState } from 'react';

// Fix 2: Move to client component and import in server
// ClientButton.tsx
'use client';
export function ClientButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// page.tsx (Server Component)
import { ClientButton } from './ClientButton';
export default function Page() {
  return <ClientButton />;
}
```

### 3.7 Missing Environment Variables

**Detection:**
```typescript
// Build fails due to undefined env var
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // undefined
```

**Fix:**
1. Add to `.env.local` file
2. Document in `.env.example`
3. Configure in Vercel dashboard
4. Provide default fallback if appropriate

```typescript
// Fixed with fallback
const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? 'default-key';
```

### 3.8 Dependency Version Mismatches

**Common Issues:**
- Peer dependency warnings
- Version conflicts
- Missing dependencies in pnpm-lock.yaml

**Fix Commands:**
```bash
# Update specific package
pnpm update package-name

# Update all packages (minor versions)
pnpm update

# Install missing peer dependencies
pnpm install

# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 3.9 Duplicate Default Exports

**Error Example:**
```typescript
// file.ts
export default function Component1() {}
export default function Component2() {} // Error: Duplicate default export
```

**Fix:**
```typescript
// Use named exports
export function Component1() {}
export function Component2() {}

// Or one default, rest named
export default function Component1() {}
export function Component2() {}
```

### 3.10 Zod Validation Issues

**Common Zod Errors:**
```typescript
// Missing validation
const schema = z.object({
  name: z.string(),
  age: z.number() // Missing .min(), .max()
});

// Fixed with proper constraints
const schema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(120)
});

// Runtime validation errors
const parsed = schema.parse(data); // Throws on invalid data

// Fixed with safe parse
const result = schema.safeParse(data);
if (!result.success) {
  // Handle validation errors
  console.error(result.error);
}
```

### 3.11 Any Other Compile-Time Blocking Errors

The agent MUST handle ANY error that prevents successful build completion:
- Syntax errors
- Invalid JSON in config files
- Malformed JSX/TSX
- Invalid regular expressions
- Path resolution failures
- Build timeout issues
- Memory issues
- File system access errors
- Permission errors

---

## 4. Auto-Fixing Rules

The agent MUST follow these strict rules when applying automatic fixes:

### 4.1 Safety First

✅ **DO:**
- Analyze error context thoroughly before fixing
- Make minimal, targeted changes
- Preserve existing functionality
- Add types instead of using `any`
- Import missing modules properly
- Follow project coding standards
- Test fixes by rebuilding immediately
- Document complex fixes in comments

❌ **DON'T:**
- Comment out large blocks of code to "fix" errors
- Remove functionality to eliminate errors
- Use `@ts-ignore` or `@ts-nocheck` as first resort
- Break existing working features
- Introduce security vulnerabilities
- Ignore warnings that might become errors
- Make unrelated changes while fixing errors
- Use `any` type as default solution

### 4.2 Fix Correctly, Not Quickly

**Priority: Correctness > Speed**

```typescript
// ❌ BAD: Quick but incorrect fix
function getData(): any {  // Using 'any' to bypass error
  return fetchData();
}

// ✅ GOOD: Correct fix with proper typing
interface DataResponse {
  id: string;
  name: string;
  value: number;
}
function getData(): Promise<DataResponse> {
  return fetchData();
}

// ❌ BAD: Commenting out to fix error
// const result = processData(input);
// return result;
return null; // Quick fix but breaks functionality

// ✅ GOOD: Fix the actual error
const result = processData(input as InputType);
return result;
```

### 4.3 Preserve Original Logic

**Core Principle: Maintain functional equivalence**

```typescript
// Original code with error
function calculate(x, y) {
  return x + y;
}

// ❌ BAD: Changes behavior
function calculate(x: number, y: number): number {
  return x * y; // Changed logic to "fix" error
}

// ✅ GOOD: Preserves logic, adds types
function calculate(x: number, y: number): number {
  return x + y; // Same logic, proper types
}
```

### 4.4 Remove Dead Code Safely

**When to Remove:**
- Unused imports (verified by ESLint)
- Unreachable code after return statements
- Variables defined but never used
- Functions not called anywhere
- Debug code (console.log, debugger)

**How to Remove:**
```typescript
// ❌ BAD: Removing potentially used code
// import { someFunction } from './utils'; // Might be used indirectly

// ✅ GOOD: Safe removal after verification
// Remove only if confirmed unused by:
// 1. ESLint no-unused-vars rule
// 2. TypeScript unused variable detection
// 3. Search in codebase shows no usage

// Before
import { used, unused } from './utils'; // ESLint: 'unused' is defined but never used
function Component() {
  return <div>{used}</div>;
}

// After
import { used } from './utils';
function Component() {
  return <div>{used}</div>;
}
```

### 4.5 Convert Deprecated APIs

**Modernization Strategy:**

```typescript
// ❌ OLD: Using deprecated APIs
componentWillMount() {
  this.fetchData();
}

// ✅ NEW: Modern equivalent
useEffect(() => {
  fetchData();
}, []);

// ❌ OLD: Class component with issues
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.value}</div>;
  }
}

// ✅ NEW: Functional component (when appropriate)
function MyComponent({ value }: { value: string }) {
  return <div>{value}</div>;
}

// ❌ OLD: Deprecated Next.js API
import { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ data: 'test' });
}

// ✅ NEW: Next.js 13+ App Router
export async function GET(request: Request) {
  return Response.json({ data: 'test' });
}
```

### 4.6 Minimal Change Principle

**Apply the smallest fix that resolves the error:**

```typescript
// Error: Property 'name' does not exist on type '{}'

// ❌ BAD: Over-engineering
interface CompleteUserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  address: Address;
  preferences: Preferences;
  // ... 20 more fields
}
const user: CompleteUserProfile = { ... };

// ✅ GOOD: Minimal fix
interface User {
  name: string;
}
const user: User = { name: 'John' };

// Or even simpler if only used once
const user: { name: string } = { name: 'John' };
```

### 4.7 Type Safety Over Type Suppression

**Prefer adding proper types over suppressing errors:**

```typescript
// ❌ BAD: Suppressing errors
const data = apiResponse as any;
// @ts-ignore
const result = data.process();

// ✅ GOOD: Proper typing
interface ApiResponse {
  process(): Result;
}
const data = apiResponse as ApiResponse;
const result = data.process();

// ❌ BAD: Using any everywhere
function handleData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ GOOD: Specific types
interface DataItem {
  value: string;
}
function handleData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

### 4.8 Import Organization

**Maintain clean import structure:**

```typescript
// ✅ GOOD: Organized imports
// 1. External packages
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import axios from 'axios';

// 2. Internal modules (absolute paths)
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// 3. Local/relative imports
import { helper } from './utils/helper';
import type { LocalType } from './types';

// 4. Styles
import styles from './Component.module.css';
```

---

## 5. Production-Ready Rules

The agent MUST ensure the codebase meets production standards:

### 5.1 TypeScript Strict Mode Stability

**Requirement:** All code must compile successfully with TypeScript strict mode enabled.

**Strict Mode Checks:**
```json
// tsconfig.json must have
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Validation Command:**
```bash
# Must pass without errors
pnpm run type-check
# or
tsc --noEmit
```

### 5.2 Vercel Build Must Not Fail

**Critical Requirement:** `pnpm build` must complete successfully for Vercel deployment.

**Pre-Deployment Checklist:**
- ✅ `pnpm build` exits with code 0
- ✅ No TypeScript compilation errors
- ✅ No ESLint errors (only warnings allowed)
- ✅ All routes and pages compile successfully
- ✅ API routes have proper exports
- ✅ Environment variables documented
- ✅ No missing dependencies
- ✅ next.config.js is valid
- ✅ All imports resolve correctly
- ✅ No circular dependencies causing build failures

**Build Output Checks:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    XXX kB
├ ○ /api/execute                         
├ ○ /api/screenshots
└ ○ /workflows                           XXX kB

○  (Static)  automatically rendered as static HTML
```

### 5.3 Every Route, Page, and Component Must Compile

**Comprehensive Validation:**

```bash
# Check all TypeScript files
find app -name "*.tsx" -o -name "*.ts" | xargs tsc --noEmit

# Check for common issues
grep -r "@ts-ignore" app/  # Should return nothing
grep -r "@ts-nocheck" app/ # Should return nothing
grep -r "any" app/ --include="*.ts" --include="*.tsx" # Investigate all uses
```

**File-Level Validation:**
- ✅ All pages export default component
- ✅ All layouts export default component
- ✅ All API routes export HTTP method handlers
- ✅ All components have proper TypeScript types
- ✅ All dynamic routes have proper param types
- ✅ All async server components are properly typed

### 5.4 No Missing Exports

**Export Validation Rules:**

```typescript
// ✅ Pages must have default export
// app/page.tsx
export default function HomePage() {
  return <div>Home</div>;
}

// ✅ Layouts must have default export
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}

// ✅ API routes must export HTTP methods
// app/api/data/route.ts
export async function GET(request: Request) {
  return Response.json({ data: [] });
}

// ✅ Metadata for SEO
// app/page.tsx
export const metadata = {
  title: 'Page Title',
  description: 'Description'
};
```

**Automated Export Check:**
```bash
# Verify all pages have default exports
for file in $(find app -name "page.tsx"); do
  if ! grep -q "export default" "$file"; then
    echo "Missing default export: $file"
  fi
done
```

### 5.5 Test Critical Flows After Fixing

**Critical Flow Verification:**

After all fixes are applied, verify:

1. **Home Page Loads**
   ```bash
   # Development server check
   pnpm dev &
   sleep 5
   curl -f http://localhost:3000 > /dev/null && echo "✅ Home page OK"
   ```

2. **API Routes Respond**
   ```bash
   curl -X POST http://localhost:3000/api/execute \
     -H "Content-Type: application/json" \
     -d '{"task":"test"}' | jq .
   ```

3. **Static Pages Build**
   ```bash
   pnpm build
   # Check .next/server/app/ for generated pages
   ```

4. **Type Safety**
   ```bash
   pnpm run type-check
   ```

5. **Lint Passes**
   ```bash
   pnpm run lint
   ```

### 5.6 Optimize Imports for Tree-Shaking

**Import Optimization Rules:**

```typescript
// ❌ BAD: Imports everything
import * as lodash from 'lodash';
const result = lodash.debounce(fn);

// ✅ GOOD: Import only what's needed
import { debounce } from 'lodash';
const result = debounce(fn);

// ❌ BAD: Barrel import from large library
import { Button, Card, Modal, ... } from '@/components';

// ✅ GOOD: Direct imports
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

// For next.js specifically
import dynamic from 'next/dynamic';

// ❌ BAD: Import large component eagerly
import HeavyComponent from './HeavyComponent';

// ✅ GOOD: Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

---

## 6. Vercel Deployment Guidelines

The agent MUST ensure zero deployment issues on Vercel.

### 6.1 Environment Variables

**Verification Process:**

1. **Document Required Variables**
   ```bash
   # .env.example must list all required vars
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.example.com
   DATABASE_URL=postgresql://...
   API_SECRET_KEY=xxxxx
   ```

2. **Check for Undefined Variables**
   ```typescript
   // Detect usage of undefined env vars
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   if (!apiUrl) {
     throw new Error('NEXT_PUBLIC_API_URL is not defined');
   }
   ```

3. **Vercel Configuration**
   ```bash
   # Ensure variables are set in Vercel dashboard
   # Check via Vercel CLI
   vercel env ls
   ```

### 6.2 Build Configuration

**next.config.js Validation:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Production settings
  reactStrictMode: true,
  swcMinify: true,
  
  // ✅ Image optimization (if using next/image)
  images: {
    domains: ['allowed-domains.com'],
  },
  
  // ✅ Proper redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

**Validation Command:**
```bash
# Validate configuration
node -e "require('./next.config.js')"
```

### 6.3 Vercel.json Configuration

**Optimal Vercel Configuration:**

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install && npx playwright install chromium",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "memory": 2048,
      "maxDuration": 60
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 6.4 Preventing Authority Limit Errors

**Common Issues and Solutions:**

#### Memory Limits
```json
// Hobby plan: Max 2GB per function
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 2048  // Don't exceed for Hobby plan
    }
  }
}
```

#### Timeout Limits
```json
// Hobby plan: Max 60s per function
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60  // Max for Hobby plan
    }
  }
}
```

#### Build Time Limits
- Keep builds under 15 minutes
- Optimize dependencies
- Use build cache effectively

**Solution: Optimize Heavy Operations**
```typescript
// ❌ BAD: Long-running operation in API route
export async function GET() {
  await heavyOperation(); // Takes 2 minutes
  return Response.json({ result });
}

// ✅ GOOD: Use background job or optimize
export async function GET() {
  // Option 1: Make operation async with status endpoint
  const jobId = await queueJob();
  return Response.json({ jobId, status: 'processing' });
  
  // Option 2: Optimize to complete faster
  const result = await optimizedOperation(); // Takes 30 seconds
  return Response.json({ result });
}
```

### 6.5 Root-Level Build Blocker Prevention

**Check for Common Blockers:**

1. **Invalid package.json**
   ```bash
   # Validate JSON
   cat package.json | jq empty
   ```

2. **Missing Dependencies**
   ```bash
   # Ensure all deps are in package.json
   pnpm install
   ```

3. **Invalid TypeScript Config**
   ```bash
   # Validate tsconfig.json
   tsc --showConfig
   ```

4. **Broken Next.js Config**
   ```bash
   node -c next.config.js
   ```

5. **Git Issues**
   ```bash
   # Ensure .gitignore excludes build artifacts
   echo "node_modules/" >> .gitignore
   echo ".next/" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

### 6.6 Deployment Readiness Verification

**Pre-Push Checklist:**

```bash
#!/bin/bash
# deployment-check.sh

echo "🔍 Running deployment readiness checks..."

# 1. Build succeeds
echo "1️⃣ Checking build..."
pnpm build || exit 1

# 2. Type check passes
echo "2️⃣ Checking types..."
pnpm run type-check || exit 1

# 3. Lint passes
echo "3️⃣ Checking lint..."
pnpm run lint || exit 1

# 4. Environment variables documented
echo "4️⃣ Checking env vars..."
[ -f .env.example ] || { echo "❌ .env.example missing"; exit 1; }

# 5. Vercel config valid
echo "5️⃣ Checking vercel.json..."
[ -f vercel.json ] && cat vercel.json | jq empty || echo "⚠️ vercel.json invalid or missing"

# 6. No critical files in gitignore
echo "6️⃣ Checking .gitignore..."
grep -q "^\.next/$" .gitignore || echo "⚠️ .next/ not in .gitignore"
grep -q "^node_modules/$" .gitignore || echo "⚠️ node_modules/ not in .gitignore"

echo "✅ All checks passed! Ready for deployment."
```

---

## 7. Agent Result & Final Checklist

### 7.1 Pre-Commit Verification Checklist

Before committing fixes, the agent MUST verify:

#### Build Status
- [ ] `pnpm build` completes successfully (exit code 0)
- [ ] Build output shows "Compiled successfully"
- [ ] No errors in build output (stderr is empty or contains only warnings)
- [ ] All pages generated successfully
- [ ] All API routes compiled

#### Type Safety
- [ ] `tsc --noEmit` passes without errors
- [ ] `pnpm run type-check` succeeds
- [ ] No implicit `any` types (with strict mode)
- [ ] All function parameters properly typed
- [ ] All return types properly typed
- [ ] No use of `@ts-ignore` or `@ts-nocheck` (or documented if necessary)

#### Code Quality
- [ ] `pnpm run lint` passes (0 errors)
- [ ] All ESLint rules satisfied
- [ ] No unused imports
- [ ] No unused variables
- [ ] No console.log statements in production code (or documented if needed for debugging)
- [ ] Proper code formatting

#### Functionality
- [ ] All existing features still work
- [ ] No breaking changes introduced
- [ ] Error fixes don't create new errors
- [ ] Critical user flows tested
- [ ] API endpoints respond correctly

#### Dependencies
- [ ] All required packages installed
- [ ] package.json is valid JSON
- [ ] pnpm-lock.yaml is up to date
- [ ] No peer dependency warnings (or documented)
- [ ] No security vulnerabilities in dependencies

#### Configuration
- [ ] next.config.js is valid
- [ ] tsconfig.json is valid
- [ ] .eslintrc.json is valid
- [ ] vercel.json is valid (if exists)
- [ ] All config files are proper JSON/JS

#### Environment
- [ ] All environment variables documented in .env.example
- [ ] Required env vars checked in code
- [ ] No hardcoded secrets or credentials
- [ ] .env.local in .gitignore

#### Deployment
- [ ] Vercel build would succeed
- [ ] No Vercel authority limit issues
- [ ] Memory limits respected
- [ ] Timeout limits respected
- [ ] No missing required environment variables
- [ ] All routes accessible

#### Git
- [ ] All changes staged (`git add .`)
- [ ] Meaningful commit message prepared
- [ ] No unintended files staged (check .gitignore)
- [ ] No build artifacts in commit (node_modules, .next, etc.)

### 7.2 Guarantee Statement

The agent MUST provide this guarantee before committing:

```
═══════════════════════════════════════════════════════════════
           BUILD AGENT CERTIFICATION v1.0.0
═══════════════════════════════════════════════════════════════

I hereby certify that the Nava codebase has been validated and 
meets all production-ready requirements:

✅ BUILD STATUS
   • pnpm build: SUCCESS (exit code 0)
   • TypeScript compilation: PASSED
   • All pages generated: YES
   • All API routes compiled: YES

✅ TYPE SAFETY
   • TypeScript strict mode: ENABLED
   • Type check (tsc --noEmit): PASSED
   • No implicit any types: CONFIRMED
   • No type suppressions: VERIFIED

✅ CODE QUALITY
   • ESLint validation: PASSED
   • Code standards: FOLLOWED
   • Best practices: IMPLEMENTED
   • No dead code: CONFIRMED

✅ FUNCTIONALITY
   • Existing features: PRESERVED
   • Breaking changes: NONE
   • Critical flows: TESTED
   • API endpoints: FUNCTIONAL

✅ DEPENDENCIES
   • All packages installed: YES
   • Lock file updated: YES
   • No vulnerabilities: VERIFIED
   • Peer dependencies: SATISFIED

✅ CONFIGURATION
   • next.config.js: VALID
   • tsconfig.json: VALID
   • eslintrc.json: VALID
   • vercel.json: VALID

✅ DEPLOYMENT
   • Vercel build: READY
   • Memory limits: RESPECTED
   • Timeout limits: RESPECTED
   • Environment vars: DOCUMENTED
   • Authority limits: NO ISSUES

✅ VERSION CONTROL
   • Changes staged: YES
   • Commit message: PREPARED
   • No build artifacts: CONFIRMED
   • .gitignore: UPDATED

═══════════════════════════════════════════════════════════════
                 PRODUCTION READY: ✅ YES
               DEPLOYMENT SAFE: ✅ CONFIRMED
          VERCEL DEPLOYMENT: ✅ WILL SUCCEED
═══════════════════════════════════════════════════════════════

Errors Fixed: XX
Files Modified: XX
Build Time: XX seconds
Timestamp: YYYY-MM-DD HH:MM:SS UTC

Agent Version: 1.0.0
Signature: [Auto-generated Hash]
═══════════════════════════════════════════════════════════════
```

### 7.3 Deployment Success Guarantee

**The agent guarantees:**

1. **Build Success**: Vercel build will complete without errors
2. **No Authority Errors**: No permission or limit violations
3. **No Timeout Errors**: All functions complete within limits
4. **No Memory Errors**: Memory usage within plan limits
5. **Full Functionality**: All features work in production
6. **Type Safety**: Complete TypeScript safety
7. **Zero Critical Issues**: No critical bugs or vulnerabilities

**If Deployment Fails:**

The agent has failed its mission. Reasons for failure must be:
- Analyzed immediately
- Root cause identified
- Fix applied
- Process improved to prevent recurrence

**Failure is not an option. The agent MUST guarantee successful deployment.**

---

## 8. Agent Invocation & Automation

### 8.1 When to Trigger

The agent MUST be triggered automatically:

1. **On New Feature Development**
   - After new code is written
   - Before creating pull request
   - As pre-commit hook (optional)

2. **On Code Changes**
   - After modifying existing features
   - After dependency updates
   - After configuration changes

3. **On Build Failures**
   - When CI/CD build fails
   - When local build fails
   - When Vercel preview build fails

4. **Scheduled Checks**
   - Daily production build validation
   - After dependency security updates
   - Before major releases

### 8.2 Integration Points

**Git Hooks Integration:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "🤖 Running Build Agent..."

# Run agent logic
pnpm build || {
  echo "❌ Build failed - initiating auto-fix..."
  # Agent auto-fix logic here
  exit 1
}

pnpm run type-check || {
  echo "❌ Type check failed - initiating auto-fix..."
  # Agent auto-fix logic here
  exit 1
}

pnpm run lint || {
  echo "❌ Lint failed - initiating auto-fix..."
  pnpm run lint --fix
}

echo "✅ Build Agent validation complete"
```

**GitHub Actions Integration:**
```yaml
# .github/workflows/build-agent.yml
name: Build Agent Auto-Fix

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run Build Agent
        run: |
          # Attempt build
          if ! pnpm build; then
            echo "Build failed - analyzing errors..."
            # Agent fix logic
          fi
          
          # Verify fixes
          pnpm build
          pnpm run type-check
          pnpm run lint
      
      - name: Commit fixes
        if: failure()
        run: |
          git config --local user.email "build-agent@example.com"
          git config --local user.name "Build Agent"
          git add .
          git commit -m "fix: auto-resolved build errors [build-agent]"
          git push
```

### 8.3 Continuous Operation

**Agent runs continuously:**
- Monitors repository for changes
- Triggers on new commits
- Runs in CI/CD pipeline
- Integrates with deployment workflow

**Always Active:**
- Pre-commit validation
- Pre-push validation
- Pull request validation
- Production deployment validation

---

## 9. Error Recovery & Escalation

### 9.1 When Agent Cannot Fix

If agent encounters errors it cannot fix after 3 attempts:

1. **Document the Error**
   ```typescript
   interface UnfixableError {
     errorType: string;
     errorMessage: string;
     file: string;
     line: number;
     attemptedFixes: string[];
     failureReason: string;
     requiresHumanIntervention: boolean;
   }
   ```

2. **Create Issue Report**
   ```markdown
   ## Build Agent: Manual Intervention Required
   
   The build agent attempted to fix the following error but was unsuccessful:
   
   **Error Type:** TypeScript
   **File:** app/api/complex-logic/route.ts
   **Line:** 145
   **Error:** Complex type inference failure
   
   **Attempted Fixes:**
   1. Added explicit type annotations
   2. Refactored type structure
   3. Split complex type into smaller types
   
   **Why Fix Failed:**
   The error requires architectural decision about type structure
   
   **Recommended Action:**
   Review the type architecture and provide explicit type definition
   ```

3. **Notify Developer**
   - Create GitHub issue
   - Send notification
   - Block deployment until resolved

### 9.2 Rollback Strategy

If fixes make things worse:

```bash
# Agent rollback procedure
git stash push -m "build-agent-failed-fixes"
git reset --hard HEAD^
# Restore original state
# Log failure
# Try alternative approach
```

---

## 10. Success Metrics

### 10.1 Agent Performance Metrics

Track these metrics for agent effectiveness:

- **Fix Success Rate**: % of errors successfully fixed
- **Build Success Rate**: % of builds passing after agent run
- **Average Fix Time**: Time to resolve all errors
- **False Fix Rate**: % of fixes that introduce new errors
- **Manual Intervention Rate**: % of errors requiring human help
- **Deployment Success Rate**: % of deployments succeeding after agent fixes

### 10.2 Quality Metrics

- **Code Quality Score**: Based on ESLint, TypeScript strict mode
- **Type Safety Score**: % of codebase with proper types
- **Build Performance**: Build time before/after fixes
- **Zero Downtime**: % of deployments with no rollbacks

---

## 11. Final Agent Instructions

### 11.1 Operational Guidelines

**The agent MUST:**
1. Run automatically on every code change
2. Fix errors completely before committing
3. Guarantee successful Vercel deployment
4. Maintain production-ready code at all times
5. Never break existing functionality
6. Document all fixes in commit messages
7. Escalate unfixable errors immediately
8. Track and report metrics

### 11.2 Code of Conduct

**The agent SHALL:**
- Prioritize correctness over speed
- Preserve original intent of code
- Apply minimal necessary changes
- Follow project conventions
- Maintain type safety
- Ensure backward compatibility
- Document complex fixes
- Learn from failed attempts

### 11.3 Never Compromise On

- ❌ Type safety (no `any` shortcuts)
- ❌ Functionality (don't break features)
- ❌ Security (don't introduce vulnerabilities)
- ❌ Performance (don't add unnecessary overhead)
- ❌ Code quality (don't lower standards)

### 11.4 Always Guarantee

- ✅ Successful build (`pnpm build` exits 0)
- ✅ Successful type check (`tsc --noEmit` passes)
- ✅ Successful lint (`pnpm run lint` passes)
- ✅ Successful Vercel deployment
- ✅ Zero production-blocking errors
- ✅ Maintained functionality
- ✅ Production-ready code

---

## 12. Conclusion

This agent specification defines a **fully autonomous, self-healing build system** for the Nava project. The agent's singular mission is to ensure the codebase remains in a continuously deployable state, free of errors, and production-ready at all times.

**Mission Statement:**
> "To automatically detect, fix, and prevent all build errors, ensuring the Nava platform maintains 100% build success rate and seamless Vercel deployments, while preserving code quality and functionality."

**Success Definition:**
- ✅ Zero build errors
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ 100% Vercel deployment success rate
- ✅ No manual intervention required
- ✅ Production-ready code guaranteed

---

**Agent Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** Autonomous Build Agent  
**Status:** ✅ ACTIVE & OPERATIONAL

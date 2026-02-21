# Mistakes Log

This file documents mistakes made during development and their fixes. Learning from these helps prevent similar issues in the future.

## Session: 2026-02-03 - UI Readability & Markdown Rendering

| # | Mistake | Root Cause | Rectification | Time Spent |
|---|---------|------------|---------------|------------|
| 1 | Mermaid diagrams showing "syntax error" | Parentheses inside square bracket labels like `[CDN (fast)]` break Mermaid parsing | Wrapped node labels with parentheses in quotes: `["CDN (fast)"]`. Added fallback to strip parentheses if quoting fails. | ~20 min |
| 2 | Markdown tables rendering as plain text | Assumed tables weren't properly formatted. Wrote multiple regex patterns to "fix" line breaks that already existed. | **Wrong diagnosis!** Debug logging revealed tables HAD proper `\n` newlines. Real issue: ReactMarkdown doesn't support tables by default - they're a GFM extension. | ~40 min |
| 3 | Multiple failed regex attempts for table sanitization | Kept trying different regex patterns without checking the actual data first | Should have added debug logging FIRST to see the raw content format before writing fixes. | Part of #2 |
| 4 | Gradient button styling not matching design | Used custom gradient classes that didn't match the theme | Removed gradient classes to use default button styling | ~5 min |
| 5 | Mermaid ERD Parsing Error | LLM generated SQL constraints `PRIMARY KEY (a,b)` inside Mermaid `erDiagram` block | Updated prompt to explicitly forbid SQL constraint syntax in Mermaid blocks and enforce `PK`/`FK` qualifiers only. | ~10 min |
| 6 | Mermaid ERD Multiple Qualifiers | LLM generated `uuid post_id PK FK` for junction tables - erDiagram only allows ONE qualifier per attribute | Fixed prompt to use only FK for junction tables. Added sanitizer in Mermaid.tsx to auto-fix `PK FK` to `FK`. | ~15 min |

## Key Lessons Learned

### 1. Debug First, Fix Second
Always add logging to see the ACTUAL data before writing fixes. The table issue wasted 40+ minutes because I assumed the problem was formatting when it was actually missing GFM support.

### 2. Check Library Defaults
ReactMarkdown's default behavior doesn't include GFM extensions (tables, strikethrough, etc.). Always check what plugins/extensions are needed for expected functionality.

### 3. Mermaid Syntax Quirks
Mermaid has strict syntax requirements:
- Parentheses `()` indicate rounded nodes
- Square brackets `[]` indicate square nodes
- Mixing them in labels requires quoting

### 4. Use JSON.stringify for Debug Logging
When debugging string content, use `JSON.stringify()` to see exact characters including `\n`, `\t`, etc.

```javascript
// Bad - can't see newlines
console.log(content);

// Good - shows exact characters
console.log(JSON.stringify(content));
```

---
*This file is gitignored and for internal reference only.*

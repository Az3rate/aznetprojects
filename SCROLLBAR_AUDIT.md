# Sidebar Horizontal Scrollbar Audit

## Context
A persistent horizontal scrollbar appears at the bottom of the sidebar/file tree, even after multiple CSS fixes. This file tracks all findings, attempted solutions, and next troubleshooting steps.

---

## Findings
- Sidebar is a fixed-width (250px) grid cell in `TerminalLayout.tsx`.
- Sidebar and all children use `box-sizing: border-box`, `width: 100%`, `max-width: 100%`, `min-width: 0`, and `overflow-x: hidden`.
- All file/folder names use `text-overflow: ellipsis`, `white-space: nowrap`, and `overflow: hidden`.
- Padding on sidebar and children is now minimal (`theme.spacing.sm` or `xs`).
- The scrollbar is now much shorter, but still present.
- The DOM tree shows deeply nested divs, but all appear to use the correct class-based styles.
- The issue persists across all browsers and OSes tested.
- **Global styles** set `box-sizing: border-box` for all elements; no global min-width or overflow issues found.
- **PageLayout** uses grid for header/main/footer; main area's padding could slightly reduce available width, but not enough to explain persistent overflow.
- **TerminalLayout** grid and sidebar cell are correct; `min-width: 0` and `box-sizing: border-box` are set.
- **All sidebar and file tree containers/items** have correct width, max-width, min-width, and overflow settings.
- **No obvious flex/grid misconfiguration** found in any component.

---

## Attempted Solutions
- Reduced sidebar padding from `lg` to `sm`.
- Added `box-sizing: border-box` to all sidebar containers and children.
- Added `min-width: 0` to all sidebar containers and children.
- Set `overflow-x: hidden` on all containers.
- Set `width: 100%` and `max-width: 100%` on all containers and children.
- Ensured all file/folder names are truncated with ellipsis.

---

## Hypotheses
- The sum of padding, border, and scrollbar width may still slightly exceed 250px.
- There may be a nested container or flex/grid misconfiguration not yet identified.
- The scrollbar may be caused by a browser-specific rendering quirk or a hidden element.
- The grid layout itself may be forcing overflow due to the way columns are defined.

---

## Next Troubleshooting Steps
1. **Visually inspect with outlines:** Add `outline: 1px solid red` to all sidebar children to see which element is causing the overflow.
2. **Test with `overflow: clip`:** Try `overflow-x: clip` on the sidebar and file tree.
3. **Reduce sidebar width:** Temporarily set the sidebar width to `240px` to see if the scrollbar disappears (indicating a 10px overflow).
4. **Check for hidden/absolutely positioned elements:** Look for any elements that may be positioned outside the normal flow.
5. **Check for browser-specific quirks:** Test in multiple browsers and OSes.
6. **Audit for any global styles or resets** that may affect box-sizing or overflow.

---

## Notes
- This file will be updated with each new finding or attempted fix until the issue is fully resolved. 
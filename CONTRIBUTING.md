# Contributing to Pace

Welcome to the Pace team! We're vibe-coding this project, and to avoid merge conflicts and ensure a smooth development experience, please strictly adhere to the following rules:

## 1. Stay in Your Assigned Folder
This is your "feature territory." Do not modify files outside your designated folder without discussing it with the team first:

- **Adam**: `frontend/src/components/ui/theme`
- **Max**: `frontend/src/components/garden`
- **James**: `frontend/src/components/profile`
- **Alessio**: `frontend/src/components/pilot`
- **Ethan**: `frontend/src/components/calendar`
- **Me**: `frontend/src/lib/core`

## 2. State Management Rules
- Use local `useState` for all your component-level state for now.
- **Do not touch** the global `store.ts` (if it exists) until the weekly sync meeting. We will integrate global state collectively.

## 3. UI Resources (Ask Adam!)
If you need a new shared UI element, theme color, or global style variation:
- Ask **Adam** to add it to the `theme` folder first.
- Do not create ad-hoc generic buttons or layouts in your own folders if they should be a core visual component.

Let's build something awesome, one feature territory at a time. Happy vibe-coding!

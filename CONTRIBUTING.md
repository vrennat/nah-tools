# Contributing to nah

Thanks for your interest in contributing. nah is an indie open-source project — the process is intentionally lightweight.

## Setup

```bash
git clone https://github.com/vrennat/nah-tools.git
cd nah-tools
bun install
bun run dev
```

The dev server runs at `http://localhost:5173`.

## Running Checks

```bash
bun run check
```

This runs TypeScript type checking and Svelte diagnostics. Make sure it passes before submitting a PR.

## Pull Requests

- One feature or fix per PR.
- Include a brief description of what the change does and why.
- Keep PRs small and focused. If you're doing something large, open an issue first to discuss.

## Code Style

- **Svelte 5** runes mode (`$state`, `$derived`, `$effect`, `$props`).
- **Tailwind CSS v4** for styling. Use the project's theme tokens (`accent`, `surface`, `border`, `text`, `text-muted`, etc.).
- **TypeScript** in strict mode. No `any` unless absolutely necessary.
- No comments or docstrings unless the code is genuinely non-obvious.

## Reporting Bugs

Open an issue on [GitHub](https://github.com/vrennat/nah-tools/issues) with steps to reproduce.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

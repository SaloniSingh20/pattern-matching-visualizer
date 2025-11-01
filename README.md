# Pattern Matching Visualizer (KMP & Boyer-Moore)

A small visualizer demonstrating the Knuth–Morris–Pratt (KMP) and a simplified Boyer–Moore string-search algorithms.

What’s in this repo

- `src/main.cpp` — terminal-based visualizer written in portable C++ (builds to `visualizer.exe` on Windows)
- `web/index.html`, `web/style.css`, `web/app.js` — simple browser-based UI and JS implementation for quick demos

Quick start (Windows PowerShell)

Requirements: a C++17-capable compiler (g++/MinGW or MSVC) or Node/Python for the web UI.

Build the terminal visualizer (example using g++ / MinGW):

```powershell
g++ -std=c++17 -O2 -o visualizer src/main.cpp
```

Run the terminal visualizer:

```powershell
./visualizer.exe
```

Open the web visualizer

You can open `web/index.html` directly in your browser. To serve it from a local HTTP server (recommended):

```powershell
# with Python 3
python -m http.server 8080
# then open http://localhost:8080/web/index.html
```

Interactive usage (terminal executable)

1. Enter the text (single line) and press Enter.
2. Enter the pattern and press Enter.
3. Choose algorithm: `1` = KMP, `2` = Boyer–Moore.
4. During stepping:
   - `n` or empty line: step one comparison
   - `a`: auto-run (animated)
   - `f`: finish
   - `q`: quit

Notes & recommendations

- I added a `.gitignore` to avoid committing build artifacts and editor files.
- `visualizer.exe` was previously committed; it is now untracked and ignored going forward. If you want this binary fully removed from the repository history (so it doesn't count toward repo size), I can help rewrite history with `git filter-repo` or `git filter-branch`—warning: that rewrites commits and requires coordination if the repo is already shared.
- If you prefer a cross-platform build system (CMake) or CI via GitHub Actions, I can add those next.

Contributing

Feel free to open issues or PRs. If you'd like features such as full Boyer–Moore (good-suffix table), colored terminal output, or a richer web UI, tell me and I’ll add them.

---
Generated on Nov 1, 2025

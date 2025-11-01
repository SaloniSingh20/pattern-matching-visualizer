# Pattern Matching Visualizer (KMP & Boyer-Moore)

This is a small interactive terminal visualizer written in portable C++ that demonstrates step-by-step comparisons and table construction for:


Files
 
 Web UI
 - `web/index.html` — browser-based visualizer
 - `web/style.css` — styles
 - `web/app.js` — UI and algorithms in JS

Build (Windows PowerShell)

You need a C++17-capable compiler (g++/MinGW or MSVC). Example using g++:

```powershell
g++ -std=c++17 -O2 -o visualizer src/main.cpp
```

Run

```powershell
.\visualizer.exe
```

Usage

1. Paste or type the text (single-line) and press Enter.
2. Paste or type the pattern and press Enter.
3. Choose algorithm: type `1` for KMP or `2` for Boyer-Moore and press Enter.
4. Interactive commands during stepping:
   - `n` or empty line: step to the next comparison
   - `a`: run auto (animated) until completion
   - `f`: finish (run the rest of the search automatically)
   - `q`: quit

Notes

If you'd like a GUI version, colorized output, or extension with the full Boyer-Moore (including good-suffix rule), tell me and I can implement it next.

 Open the website

 You can open the file `web/index.html` directly in a browser, or run a tiny static server from PowerShell:

 ```powershell
 # using Python 3
 python -m http.server 8080
 # then open http://localhost:8080/web/index.html
 ```

---
Generated on Nov 1, 2025

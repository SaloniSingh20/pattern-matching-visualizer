// Pattern Matching Visualizer
// Interactive terminal visualizer for KMP (with LPS) and Boyer-Moore (bad character rule)
// Build: g++ -std=c++17 -O2 -o visualizer src/main.cpp

#include <bits/stdc++.h>
#include <thread>
#include <chrono>
using namespace std;

static void print_heading(const string &title) {
    cout << "\n=== " << title << " ===\n";
}

// Utility: show alignment and caret under current compare index
void show_alignment(const string &text, const string &pat, int shift, int compare_text_idx, int compare_pat_idx, bool is_match) {
    // Print text
    cout << text << "\n";

    // Print spaces then pattern
    for (int i = 0; i < shift; ++i) cout << ' ';
    cout << pat << "\n";

    // Print caret line
    for (int i = 0; i < compare_text_idx; ++i) cout << ' ';
    if (compare_text_idx >= 0 && compare_text_idx < (int)text.size()) {
        cout << (is_match ? 'M' : 'X') << "\n";
    } else cout << "\n";
}

vector<int> computeLPS(const string &pat) {
    int m = pat.size();
    vector<int> lps(m);
    lps[0] = 0;
    int len = 0;
    int i = 1;
    while (i < m) {
        if (pat[i] == pat[len]) {
            ++len;
            lps[i] = len;
            ++i;
        } else {
            if (len != 0) {
                len = lps[len-1];
            } else {
                lps[i] = 0;
                ++i;
            }
        }
    }
    return lps;
}

vector<int> buildLastOccurrence(const string &pat) {
    const int ALPH = 256;
    vector<int> last(ALPH, -1);
    for (int i = 0; i < (int)pat.size(); ++i) last[(unsigned char)pat[i]] = i;
    return last;
}

// Interactive KMP visualizer
void run_kmp(const string &text, const string &pat) {
    int n = text.size(), m = pat.size();
    if (m == 0) { cout << "Empty pattern — matches at every position.\n"; return; }

    vector<int> lps = computeLPS(pat);

    print_heading("LPS (failure function)");
    cout << "Index: ";
    for (int i = 0; i < m; ++i) cout << i << ' ';
    cout << "\nValue: ";
    for (int v : lps) cout << v << ' ';
    cout << "\n";

    cout << "\nInteractive stepping: commands: n(next), a(auto), f(find all), q(quit)\n";

    int i = 0; // index for text
    int j = 0; // index for pat
    int comparisons = 0;
    bool done = false;
    string cmd;
    while (!done && i < n) {
        // compare text[i] and pat[j]
        bool match = (text[i] == pat[j]);
        ++comparisons;

        cout << "\nShift = " << (i - j) << ", compare text[" << i << "]='" << text[i] << "' with pat[" << j << "]='" << pat[j] << "' -> " << (match?"MATCH":"MISMATCH") << "\n";
        show_alignment(text, pat, i - j, i, j, match);

        cout << "Comparisons so far: " << comparisons << "\n> ";
        if (!getline(cin, cmd)) return; // EOF
        if (cmd == "q") return;
        if (cmd == "f") {
            // run full search automatically from here
            while (i < n) {
                if (text[i] == pat[j]) { ++i; ++j; }
                if (j == m) {
                    cout << "\nPattern found at index " << (i-j) << "\n";
                    j = lps[j-1];
                } else if (i < n && text[i] != pat[j]) {
                    if (j != 0) j = lps[j-1];
                    else ++i;
                }
            }
            return;
        }
        if (cmd == "a") {
            // run auto until end with small pause
            while (i < n) {
                bool mt = (text[i] == pat[j]);
                cout << "\nShift = " << (i - j) << ", compare text[" << i << "]='" << text[i] << "' with pat[" << j << "]='" << pat[j] << "' -> " << (mt?"MATCH":"MISMATCH") << "\n";
                show_alignment(text, pat, i - j, i, j, mt);
                ++comparisons;
                if (mt) { ++i; ++j; if (j==m) { cout << "\nPattern found at index " << (i-j) << "\n"; j = lps[j-1]; } }
                else { if (j!=0) j = lps[j-1]; else ++i; }
                // auto-run: no pause in this build (remove dependency on threads)
            }
            cout << "Done. Total comparisons: " << comparisons << "\n";
            return;
        }

        // default: next step
        if (match) { ++i; ++j; if (j == m) { cout << "\nPattern found at index " << (i-j) << "\n"; j = lps[j-1]; } }
        else {
            if (j != 0) j = lps[j-1]; else ++i;
        }
    }
    cout << "Search finished. Total comparisons: " << comparisons << "\n";
}

// Interactive Boyer-Moore (bad character only)
void run_boyer_moore(const string &text, const string &pat) {
    int n = text.size(), m = pat.size();
    if (m == 0) { cout << "Empty pattern — matches at every position.\n"; return; }

    vector<int> last = buildLastOccurrence(pat);

    print_heading("Bad-character last-occurrence table (showing present chars)");
    for (int c = 0; c < 256; ++c) {
        if (last[c] != -1) cout << "'" << (char)c << "' -> " << last[c] << "   ";
    }
    cout << "\n";

    cout << "\nInteractive stepping: commands: n(next), a(auto), f(find all), q(quit)\n";

    int s = 0; // shift
    int comparisons = 0;
    string cmd;
    while (s <= n - m) {
        int j = m - 1;
        while (j >= 0) {
            bool match = (pat[j] == text[s+j]);
            ++comparisons;
            cout << "\nShift = " << s << ", compare text[" << s+j << "]='" << text[s+j] << "' with pat[" << j << "]='" << pat[j] << "' -> " << (match?"MATCH":"MISMATCH") << "\n";
            show_alignment(text, pat, s, s+j, j, match);

            cout << "Comparisons so far: " << comparisons << "\n> ";
            if (!getline(cin, cmd)) return;
            if (cmd == "q") return;
            if (cmd == "f") {
                // run full search from current shift
                while (s <= n-m) {
                    int jj = m-1;
                    while (jj>=0 && pat[jj]==text[s+jj]) { ++comparisons; --jj; }
                    if (jj<0) { cout << "\nPattern found at index " << s << "\n"; s += (s+m < n ? m - last[(unsigned char)text[s+m]] : 1); }
                    else { ++comparisons; int lo = last[(unsigned char)text[s+jj]]; s += max(1, jj - lo); }
                }
                cout << "Done. Total comparisons: " << comparisons << "\n";
                return;
            }
            if (cmd == "a") {
                // auto from here
                while (s <= n-m) {
                    int jj = m-1;
                    while (jj>=0 && pat[jj]==text[s+jj]) { ++comparisons; --jj; }
                    if (jj<0) {
                        cout << "\nPattern found at index " << s << "\n";
                        int shift = (s+m < n) ? m - last[(unsigned char)text[s+m]] : 1;
                        s += shift;
                    } else {
                        ++comparisons;
                        int lo = last[(unsigned char)text[s+jj]];
                        s += max(1, jj - lo);
                    }
                    // auto-run: no pause in this build (remove dependency on threads)
                }
                cout << "Done. Total comparisons: " << comparisons << "\n";
                return;
            }

            if (match) { --j; continue; }
            else {
                int lo = last[(unsigned char)text[s+j]];
                int shift = max(1, j - lo);
                cout << "Mismatch -> bad-character last-occurrence for '" << text[s+j] << "' = " << lo << ", shifting by " << shift << "\n";
                s += shift;
                break; // move to next shift
            }
        }
        if (j < 0) {
            cout << "\nPattern found at index " << s << "\n";
            int shift = (s + m < n) ? m - last[(unsigned char)text[s + m]] : 1;
            s += shift;
        }
    }
    cout << "Search finished. Total comparisons: " << comparisons << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << "Pattern Matching Visualizer (KMP & Boyer-Moore)\n";
    cout << "Enter text (single line):\n";
    string text;
    if (!getline(cin, text)) return 0;
    cout << "Enter pattern (single line):\n";
    string pat;
    if (!getline(cin, pat)) return 0;

    cout << "Choose algorithm: (1) KMP  (2) Boyer-Moore\n> ";
    string sel;
    if (!getline(cin, sel)) return 0;
    if (sel == "2") run_boyer_moore(text, pat);
    else run_kmp(text, pat);

    cout << "Finished.\n";
    return 0;
}

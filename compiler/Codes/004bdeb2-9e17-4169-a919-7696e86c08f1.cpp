#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

// Merge function
vector<vector<int>> merge(vector<vector<int>>& intervals) {
    vector<vector<int>> res;
    if (intervals.empty()) return res;

    sort(intervals.begin(), intervals.end());
    res.push_back(intervals[0]);

    for (int i = 1; i < intervals.size(); ++i) {
        if (res.back()[1] >= intervals[i][0]) {
            res.back()[1] = max(res.back()[1], intervals[i][1]);
        } else {
            res.push_back(intervals[i]);
        }
    }
    return res;
}

// Helper to parse string input like [[1,3],[2,6]]
vector<vector<int>> parseInput(string s) {
    vector<vector<int>> intervals;
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());

    stringstream ss(s);
    string temp;
    while (getline(ss, temp, ',')) {
        int start = stoi(temp);
        getline(ss, temp, ',');
        int end = stoi(temp);
        intervals.push_back({start, end});
    }
    return intervals;
}

// Helper to format output
string formatOutput(vector<vector<int>>& merged) {
    stringstream out;
    out << "[";
    for (int i = 0; i < merged.size(); ++i) {
        out << "[" << merged[i][0] << "," << merged[i][1] << "]";
        if (i != merged.size() - 1) out << ",";
    }
    out << "]";
    return out.str();
}

int main() {
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;

        vector<vector<int>> intervals = parseInput(line);
        vector<vector<int>> result = merge(intervals);
        cout << formatOutput(result) << endl;
        cout << "------" << endl;
    }
    return 0;
}

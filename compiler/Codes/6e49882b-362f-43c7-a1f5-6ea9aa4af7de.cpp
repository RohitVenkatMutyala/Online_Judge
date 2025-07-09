#include <iostream>
#include <unordered_set>
#include <string>
using namespace std;

int lengthOfLongestSubstring(const string &s) {
    unordered_set<char> seen;
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.length(); ++right) {
        while (seen.find(s[right]) != seen.end()) {
            seen.erase(s[left]);
            ++left;
        }
        seen.insert(s[right]);
        maxLen = max(maxLen, right - left + 1);
    }

    return maxLen;
}

int main() {
    string s;
    cin>>s;
   // getline(cin, s);  // Read full line as input
    cout << lengthOfLongestSubstring(s) << endl;
    return 0;
}

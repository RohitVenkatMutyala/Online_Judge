#include <iostream>
#include <stack>
using namespace std;

bool isValid(string s) {
    stack<char> stk;
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') {
            stk.push(ch);
        } else {
            if (stk.empty()) return false;
            if ((ch == ')' && stk.top() != '(') ||
                (ch == ']' && stk.top() != '[') ||
                (ch == '}' && stk.top() != '{'))
                return false;
            stk.pop();
        }
    }
    return stk.empty();
}

int main() {
    string s;
    while (getline(cin, s)) {
        if (s.empty()) continue;
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}

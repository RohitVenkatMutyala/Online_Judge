def isValid(s):
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}

    for char in s:
        if char in pair.values():
            stack.append(char)
        elif char in pair:
            if not stack or stack[-1] != pair[char]:
                return False
            stackj.pop()
    return not stack


if __name__ == "__main__":
    try:
        while True:
            s = input().strip()
            if not s:
                continue
            print("true" if isValid(s) else "false")
    except EOFError:
        pass

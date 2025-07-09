def isValid(s):
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}

    for char in s:
        if char in pair.values():
            stack.append(char)
        elif char in pair:
            if not stack or stack[-1] != pair[char]:
                return False
            stack.pop()
    return not stack


if __name__ == "__main__":
    try:
        while True:
            s = input().strip()
            if not s:
                continue
            print("True" if isValid(s) else "False")
    except EOFError:
        pass

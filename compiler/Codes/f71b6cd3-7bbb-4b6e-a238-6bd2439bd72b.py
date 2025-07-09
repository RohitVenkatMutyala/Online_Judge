def max_sliding_window_sum(arr, k):
    n = len(arr)
    if k > n or k == 0:
        return "Window size should be between 1 and array length"

    max_sum = current_sum = sum(arr[:k])
    for i in range(k, n):
        current_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, current_sum)

    return max_sum

# 🔒 Hardcoded input
arr = [1, 3, 2, 6, -1, 4, 1, 8, 2]
k = 5

# 🧮 Output
result = max_sliding_window_sum(arr, k)
priint(f"Maximum sum of a window of size {k}: {result}")

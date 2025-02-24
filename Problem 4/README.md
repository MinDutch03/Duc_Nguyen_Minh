# Problem 4: Summation to n

## a. Iterative Approach using a For Loop
- Simple and intuitive solution that adds each number sequentially.
- **Time Complexity:** O(n) as it must process each number from 1 to n.
- **Space Complexity:** O(1) as it only uses two variables regardless of input size.

## b. Mathematical Formula Approach
- Uses the well-known formula: sum = n(n+1)/2.
- **Time Complexity:** O(1) since it performs a fixed number of operations regardless of n.
- **Space Complexity:** O(1).
- Most efficient implementation for large values of n.

## c. Recursive Approach
- Breaks down the problem into smaller subproblems.
- **Time Complexity:** O(n) as it makes n recursive calls.
- **Space Complexity:** O(n) due to the call stack.
- Risk of stack overflow for large values of n.

### Conclusion:
The mathematical formula (Implementation B) is clearly superior for performance, especially with large inputs, while the recursive solution (Implementation C) would be the least efficient due to its space complexity and stack overflow risk.
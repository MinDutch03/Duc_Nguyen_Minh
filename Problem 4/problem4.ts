// Implementation A: Using a simple for loop
function sum_to_n_a(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      sum += i;
    }
    return sum;
  }
  // Time Complexity: O(n) - Linear time as we iterate through each number from 1 to n
  // Space Complexity: O(1) - Constant space as we only use two variables regardless of input size

  // Implementation B: Using the mathematical formula (n * (n + 1)) / 2
  function sum_to_n_b(n: number): number {
    return (n * (n + 1)) / 2;
  }
  // Time Complexity: O(1) - Constant time as we perform a fixed number of operations
  // Space Complexity: O(1) - Constant space as we only use the input parameter

  // Implementation C: Using recursion
  function sum_to_n_c(n: number): number {
    if (n <= 0) {
      return 0;
    }
    return n + sum_to_n_c(n - 1);
  }
  // Time Complexity: O(n) - Linear time as we make n recursive calls
  // Space Complexity: O(n) - Linear space due to the call stack for n recursive calls

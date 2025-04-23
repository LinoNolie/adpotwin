const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;

export const validate = {
  email: (email) => {
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  },

  username: (username) => {
    if (!username) return 'Username is required';
    if (!usernameRegex.test(username)) {
      return 'Username must be 3-16 characters and can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  },

  password: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  },

  betAmount: (amount, balance) => {
    if (!amount) return 'Bet amount is required';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'Invalid bet amount';
    if (numAmount <= 0) return 'Bet amount must be greater than 0';
    if (numAmount > balance) return 'Insufficient balance';
    return null;
  },

  form: (values, rules) => {
    const errors = {};
    Object.keys(rules).forEach(field => {
      const error = rules[field](values[field]);
      if (error) errors[field] = error;
    });
    return errors;
  }
};
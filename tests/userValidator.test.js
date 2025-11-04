import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  filterUsersByAge,
  formatUserName,
  createUser,
  calculateAverageAge
} from '../src/userValidator.js';

/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ describe и it
 *
 * describe - группирует связанные тесты
 * it (или test) - описывает конкретный тестовый случай
 * expect - создает утверждение для проверки
 */

// Пример 1: Простая группировка тестов
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for email without @', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('should return false for email without domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });
});

// Пример 2: Вложенные describe для группировки по сценариям
describe('validatePassword', () => {
  describe('valid passwords', () => {
    it('should accept password with 8+ chars, digit and uppercase', () => {
      expect(validatePassword('Password1')).toBe(true);
    });

    it('should accept longer complex password', () => {
      expect(validatePassword('MySecurePass123')).toBe(true);
    });
  });

  describe('invalid passwords', () => {
    it('should reject password shorter than 8 characters', () => {
      expect(validatePassword('Pass1')).toBe(false);
    });

    it('should reject password without digits', () => {
      expect(validatePassword('Password')).toBe(false);
    });

    it('should reject password without uppercase letter', () => {
      expect(validatePassword('password123')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for non-string input', () => {
      expect(validatePassword(12345678)).toBe(false);
    });

    it('should return false for null', () => {
      expect(validatePassword(null)).toBe(false);
    });
  });
});

// Пример 3: Тестирование функций с массивами
describe('filterUsersByAge', () => {
  const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 17 },
    { name: 'Charlie', age: 30 },
    { name: 'David', age: 16 }
  ];

  it('should filter users by minimum age', () => {
    const result = filterUsersByAge(users, 18);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Charlie');
  });

  it('should return all users when minAge is 0', () => {
    const result = filterUsersByAge(users, 0);
    expect(result).toHaveLength(4);
  });

  it('should return empty array when no users match', () => {
    const result = filterUsersByAge(users, 100);
    expect(result).toHaveLength(0);
  });

  it('should throw error for invalid input', () => {
    expect(() => filterUsersByAge('not an array', 18)).toThrow('Users must be an array');
  });
});

// Пример 4: Тестирование строковых операций
describe('formatUserName', () => {
  it('should capitalize first letter', () => {
    expect(formatUserName('john')).toBe('John');
  });

  it('should lowercase other letters', () => {
    expect(formatUserName('jOHN')).toBe('John');
  });

  it('should handle single character', () => {
    expect(formatUserName('j')).toBe('J');
  });

  it('should throw error for empty string', () => {
    expect(() => formatUserName('')).toThrow('Name must be a non-empty string');
  });

  it('should throw error for non-string input', () => {
    expect(() => formatUserName(123)).toThrow('Name must be a non-empty string');
  });
});

// Пример 5: Тестирование сложной функции с несколькими проверками
describe('createUser', () => {
  const validUserData = {
    email: 'test@example.com',
    password: 'Password123',
    name: 'john',
    age: 25
  };

  it('should create user with valid data', () => {
    const user = createUser(validUserData);
    expect(user).toHaveProperty('email', 'test@example.com');
    expect(user).toHaveProperty('name', 'John');
    expect(user).toHaveProperty('age', 25);
    expect(user).toHaveProperty('createdAt');
  });

  it('should throw error for invalid email', () => {
    const invalidData = { ...validUserData, email: 'invalid-email' };
    expect(() => createUser(invalidData)).toThrow('Invalid email');
  });

  it('should throw error for invalid password', () => {
    const invalidData = { ...validUserData, password: 'weak' };
    expect(() => createUser(invalidData)).toThrow('Invalid password');
  });

  it('should throw error for negative age', () => {
    const invalidData = { ...validUserData, age: -5 };
    expect(() => createUser(invalidData)).toThrow('Invalid age');
  });

  it('should throw error for age over 150', () => {
    const invalidData = { ...validUserData, age: 200 };
    expect(() => createUser(invalidData)).toThrow('Invalid age');
  });
});

// Пример 6: Тестирование вычислений
describe('calculateAverageAge', () => {
  it('should calculate average age correctly', () => {
    const users = [
      { age: 20 },
      { age: 30 },
      { age: 40 }
    ];
    expect(calculateAverageAge(users)).toBe(30);
  });

  it('should round to 2 decimal places', () => {
    const users = [
      { age: 20 },
      { age: 21 },
      { age: 22 }
    ];
    expect(calculateAverageAge(users)).toBe(21);
  });

  it('should throw error for empty array', () => {
    expect(() => calculateAverageAge([])).toThrow('Users must be a non-empty array');
  });

  it('should throw error for non-array input', () => {
    expect(() => calculateAverageAge('not an array')).toThrow('Users must be a non-empty array');
  });
});

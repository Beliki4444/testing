/**
 * Модуль для валидации и обработки пользовательских данных
 */

/**
 * Валидирует email адрес
 * @param {string} email - Email для проверки
 * @returns {boolean} - true если email валидный
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидирует пароль
 * Правила: минимум 8 символов, хотя бы одна цифра, одна заглавная буква
 * @param {string} password - Пароль для проверки
 * @returns {boolean} - true если пароль валидный
 */
export function validatePassword(password) {
  if (typeof password !== 'string') {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  const hasDigit = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);

  return hasDigit && hasUpperCase;
}

/**
 * Фильтрует пользователей по возрасту
 * @param {Array<Object>} users - Массив пользователей
 * @param {number} minAge - Минимальный возраст
 * @returns {Array<Object>} - Отфильтрованный массив пользователей
 */
export function filterUsersByAge(users, minAge) {
  if (!Array.isArray(users)) {
    throw new Error('Users must be an array');
  }

  if (typeof minAge !== 'number' || minAge < 0) {
    throw new Error('MinAge must be a positive number');
  }

  return users.filter(user => user.age >= minAge);
}

/**
 * Форматирует имя пользователя (первая буква заглавная)
 * @param {string} name - Имя пользователя
 * @returns {string} - Отформатированное имя
 */
export function formatUserName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Name must be a non-empty string');
  }

  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Создает объект пользователя с валидацией
 * @param {Object} userData - Данные пользователя
 * @param {string} userData.email - Email
 * @param {string} userData.password - Пароль
 * @param {string} userData.name - Имя
 * @param {number} userData.age - Возраст
 * @returns {Object} - Созданный объект пользователя
 * @throws {Error} - Если данные невалидны
 */
export function createUser(userData) {
  const { email, password, name, age } = userData;

  if (!validateEmail(email)) {
    throw new Error('Invalid email');
  }

  if (!validatePassword(password)) {
    throw new Error('Invalid password');
  }

  if (typeof age !== 'number' || age < 0 || age > 150) {
    throw new Error('Invalid age');
  }

  return {
    email,
    name: formatUserName(name),
    age,
    createdAt: new Date().toISOString()
  };
}

/**
 * Подсчитывает средний возраст пользователей
 * @param {Array<Object>} users - Массив пользователей
 * @returns {number} - Средний возраст
 */
export function calculateAverageAge(users) {
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('Users must be a non-empty array');
  }

  const totalAge = users.reduce((sum, user) => sum + user.age, 0);
  return Math.round((totalAge / users.length) * 100) / 100; // округление до 2 знаков
}

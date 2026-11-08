export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_REQUIREMENTS =
  'Mínimo 10 caracteres, con al menos una mayúscula, una minúscula y un número.';

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

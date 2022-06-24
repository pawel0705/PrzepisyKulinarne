/**
 * Builds regex that can be used to validation password strenght
 * @param options
 */
export function Generate(options: PasswordOptions) {
  const components: string[] = [`\\S{${options.minLength},}`];

  if (options.requireDigit) components.unshift("(?=.*\\d)");
  if (options.requireLowercase) components.unshift("(?=.*[a-z])");
  if (options.requireUppercase) components.unshift("(?=.*[A-Z])");
  if (options.requireNonAlphanumeric) components.unshift("(?=.+[\\W_])");

  return new RegExp(
    `^${components.reduce((prev, curr) => prev.concat(curr))}$`,
    "g"
  );
}

export interface PasswordOptions {
  minLength: number;
  requireDigit: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNonAlphanumeric: boolean;
}

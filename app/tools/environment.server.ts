export function getEnvironmentVariable(name: string): string | never {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable '${name}'`);
  }

  return value;
}

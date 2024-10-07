export function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

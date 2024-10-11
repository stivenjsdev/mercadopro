export function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function capitalizeWords(str: string) {
  return str
    .split(" ") // Divide el string en un arreglo de palabras
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza la primera letra y pone las demás en minúsculas
    .join(" "); // Vuelve a unir las palabras en un solo string
}


function incrementValue(value, i) {
  if (!isNaN(Number(value))) {
    // Si la valeur est un nombre, on l'incrémente
    return String(Number(value) + i);
  } else if (typeof value === 'string') {
    // Si la valeur est une chaîne de caractères, on incrémente le caractère suivant
    if (value.length !== 1) {
      // Si la valeur a plus d'un caractère, on prend uniquement le premier
      value = value.charAt(0);
    }
    return String.fromCharCode(value.charCodeAt(0) + i);
  } else {
    // Si la valeur n'est ni un nombre ni une chaîne de caractères, on retourne la valeur inchangée
    return value;
  }
}

module.exports = incrementValue;

function incrementValue(value, i) {
  if (!isNaN(Number(value))) {
    // If the value is a number, increment it
    return String(Number(value) + i);
  } else if (typeof value === 'string') {
    // If the value is a string, increment the next character
    if (value.length !== 1) {
      // If the value has more than one character, consider only the first one
      value = value.charAt(0);
    }
    return String.fromCharCode(value.charCodeAt(0) + i);
  } else {
    // If the value is neither a number nor a string, return the value unchanged
    return value;
  }
}

module.exports = incrementValue;

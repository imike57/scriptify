function transformToCamelCase(value) {
    const words = value.split(' ');

    const camelCase = words
        .map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join('');

    return camelCase;
}

module.exports = transformToCamelCase;
function transformToKebabCase(value) {
    const kebabCase = value
        .replace(/\s+/g, '-')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();

    return kebabCase;
}

module.exports = transformToKebabCase;
function transformToCapitalize(value) {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    return capitalized;
}

module.exports = transformToCapitalize;
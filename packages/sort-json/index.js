function sortJSON(json) {
  if (typeof json !== 'object' || json === null) {
    return json;
  }

  if (Array.isArray(json)) {
    return json.map(item => sortJSON(item)).sort(sortByType);
  }

  const keys = Object.keys(json).sort();
  
  const sortedJSON = {};
  keys.forEach((key) => {
    sortedJSON[key] = sortJSON(json[key]);
  });

  return sortedJSON;
}

function sortByType(a, b) {
  const typeA = typeof a;
  const typeB = typeof b;

  if (typeA === typeB) {
    if (typeA === 'object') {
      if (Array.isArray(a) && Array.isArray(b)) {
        return a.length - b.length;
      }
      return 0; // For objects, keep the original order (or could use a key-based sort)
    } else if (typeA === 'string' || typeA === 'number') {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  }

  return typeA < typeB ? -1 : 1;
}


function transform(value) {
  return JSON.stringify(sortJSON(JSON.parse(value)), null, 4);
}

module.exports = transform;

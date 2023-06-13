const _ = _require('lodash');
function transform(value) {
  return _.kebabCase(value);
}

module.exports = transform;

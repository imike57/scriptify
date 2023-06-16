
function transform(value) {
    try {
      return eval(value);
    } catch (error) {
      _log(error);
      return value;
    }
  }
  
  module.exports = transform;
  
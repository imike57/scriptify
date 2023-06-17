
function transform(value) {
    try {
      return eval(value);
    } catch (error) {
      scriptify.log(error);
      return value;
    }
  }
  
  module.exports = transform;
  
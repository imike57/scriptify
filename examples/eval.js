
function transform(value) {
    try {
      return eval(value);
    } catch (error) {
      outputChannel.clear();
      outputChannel.show(true);
      outputChannel.append(error);
      return value;
    }
  }
  
  module.exports = transform;
  
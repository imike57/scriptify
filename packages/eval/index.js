
function transform(value) {
  try {
    return eval(value);
  } catch (error) {
    console.log(error);
    return value;
  }
}

module.exports = transform;

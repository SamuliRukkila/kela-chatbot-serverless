const validate = {
  validatePin: pin => {
    if (pin.includes('hyphon')) pin.replace('hyphon', '-');

    const pinLength = pin.split(' ').join('').length;
    let status;

    if (pinLength < 1) {
      status = 'short';
    } else if (pinLength > 11) {
      status = 'long';
    } else {
      status = 'ok';
    }

    return { pin, status };
  }
};

module.exports = validate;

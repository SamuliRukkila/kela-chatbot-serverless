const validate = {
  validatePin: pin => {

    const words = ['hyphon', 'streak', 'slash', 'line', 'minus'];
    
    for (let i = 0; i < words.length; i++) {
      if (pin.contains(words[i])) pin.replace(words[i], '-');  
    }
    
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

const generateRandom5DigitNumber = () => {
  return Math.floor(10000 + Math.random() * 90000);
};
module.exports = { generateRandom5DigitNumber };

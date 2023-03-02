// return a random integer between min and max
function randomInt(min, max) {
    const range = max - min;
    return min + Math.floor(Math.random() * range);
}

module.exports = {
    randomInt
};

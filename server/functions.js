// make an API post and handle the JSON response
function postMethodFetch(data, uri, next) {
    fetch(uri, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => next(response));
}

// return a random integer between min and max
function randomInt(min, max) {
    const range = max - min;
    return min + Math.floor(Math.random() * range);
}

module.exports = {
    postMethodFetch,
    randomInt
};

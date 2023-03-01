const DOMAIN_NAME = "http://localhost:5000/";

// make an API post and handle the JSON response
function postMethodFetch(data, pathname, next) {
    fetch(DOMAIN_NAME + pathname, {
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

function element(id) {
    return document.getElementById(id);
}

// Note: This function is used only in the test page
function submit(apiName) {
    const value = element(apiName + "-input").value;
    const target = "api/" + apiName;
    console.log("Submitting " + target);
    postMethodFetch({ value }, target, response => {
        console.log(response);
        element(apiName + "-response").innerHTML = response.value;
    });
}

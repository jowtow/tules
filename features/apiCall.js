const axios = require("axios");

async function Get(url, access_token){
    try {
        var response = await axios.get(url, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}

async function Post(url, body, access_token) {
    try {
        var response = await axios.post(url, body, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}

async function Put(url, body, access_token) {
    try{
        var response = await axios.put(url, body, {
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        });
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}

function getResponseForError(err) {
    let errMessage = err.response.data?.error.message;
    let apiResponse = {};
    if (errMessage === "The access token expired"
        || errMessage === "Only valid bearer authentication supported") {
        apiResponse.NeedsTokenRefresh = true;
    }
    else {
        apiResponse.Error = errMessage;
    }
    return apiResponse;
}

module.exports = {Get, Put, Post}
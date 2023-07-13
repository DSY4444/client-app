import axios from "axios";

axios.defaults.baseURL = window.location.origin;

const fetchRequest = (url, method = "get", body = null, headers = null) => {

    if (body && typeof body === "string")
        body = JSON.parse(body);
    if (headers && typeof headers === "string")
        headers = JSON.parse(headers);

    if (method === "get") {
        let q = ("nc=" + Math.random()).replace(".", "");
        url += url.indexOf("?") > 0 ? `&${q}` : `?${q}`
    }

    return axios[method](url, body, headers)
        .then((res) => {
            return [null, res.data];
        })
        .catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.error(error.response.data);
                // console.error(error.response.status);
                // console.error(error.response.headers);
                const { data, status, headers } = error.response;
                const err = {
                    type: "server",
                    status,
                    headers,
                    data
                }
                return [err, null];
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                // console.error(error.request);
                const err = {
                    type: "client",
                    message: "no reponse from server"
                }
                return [err, null];
            } else {
                // Something happened in setting up the request that triggered an Error
                // console.error('Error', error.message);
                const err = {
                    type: "config",
                    message: error.message
                }
                return [err, null];
            }
        });
};

const getMethod = (url, headers = null) => fetchRequest(url, "get", null, headers);
const putMethod = (url, body = null, headers = null) => fetchRequest(url, "put", body, headers);
const postMethod = (url, body = null, headers = null) => fetchRequest(url, "post", body, headers);
const deleteMethod = (url, headers = null) => fetchRequest(url, "delete", null, headers);

export default {
    get: getMethod,
    put: putMethod,
    post: postMethod,
    delete: deleteMethod
};

// .catch(function (error) {
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       console.error(error.response.data);
//       console.error(error.response.status);
//       console.error(error.response.headers);
//     } else if (error.request) {
//       // The request was made but no response was received
//       // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
//       // http.ClientRequest in node.js
//       console.error(error.request);
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       console.error('Error', error.message);
//     }
//     console.error(error.config);
//   });
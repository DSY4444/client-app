import { useEffect, useRef, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = window.location.origin;

const useFetchRequest = (url, method = "get", body = null, headers = null) => {
    const isMounted = useRef(true);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setloading] = useState(false);
    const [reload, setReload] = useState(null);

    const fetchData = () => {
        const source = axios.CancelToken.source();
        setloading(true);
        setError(null);
        if (body && typeof body === "string")
            body = JSON.parse(body);
        if (headers && typeof headers === "string")
            headers = JSON.parse(headers);

        if (method === "get") {
            let q = ("nc=" + Math.random()).replace(".", "");
            url += url.indexOf("?") > 0 ? `&${q}` : `?${q}`
        }

        axios[method](url, body, headers)
            .then((res) => {
                if (isMounted.current) {
                    setResponse(res.data);
                }
            })
            .catch((error) => {
                if (isMounted.current) {
                    let err = null;
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        const { data, status, headers } = error.response;
                        err = {
                            type: "server",
                            status,
                            headers,
                            data
                        }
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        err = {
                            type: "client",
                            message: "no reponse from server"
                        }
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.error('Error', error.message);
                        err = {
                            type: "config",
                            message: error.message
                        }
                    }

                    setError(err);
                }
            })
            .finally(() => {
                if (isMounted.current) {
                    setloading(false);
                }
            });

        return () => {
            source.cancel();
        }
    };

    useEffect(() => {
        fetchData();
    }, [method, url, headers, reload]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const reloadData = () => {
        setReload(Math.random());
    }

    return { response, error, loading, reloadData };
}

export default useFetchRequest;
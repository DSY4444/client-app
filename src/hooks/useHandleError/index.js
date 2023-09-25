import { useNavigate } from "react-router-dom";

const useHandleError = () => {
    const navigate = useNavigate();
    const handleError = (error) => {
        if (error) {
            switch (error.type) {
                case "server": {
                    const { status } = error;
                    if (status === 403) {
                        navigate("/access-denied");
                    }
                    else if (status === 404) {
                        navigate("/not-found");
                    }
                    else if (status === 400) {
                        navigate("/error");
                    }
                    else if (status === 500) {
                        navigate("/error");
                    }
                    else if (status === 401) {
                        window.location.reload();
                    }
                    break;
                }
                case "client":
                    navigate("/error", { state: { errorType: "client" } });
                    break;
                case "config":
                    console.error("config error");
                    break;
            }
        }
    };

    return handleError;
}

export default useHandleError;
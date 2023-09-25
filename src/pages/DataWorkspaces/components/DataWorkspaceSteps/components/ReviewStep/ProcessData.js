import { useEffect } from "react";
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";
import fetchRequest from "utils/fetchRequest";

const ProcessData = (props) => {
    const { workspaceId, onSuccess } = props;
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getData() {
            var [err, ] = await fetchRequest.post(`/api/dataWorkspaces/processdata/${workspaceId}`)
            if (err) {
                // handleError(err);
                // setLoading(false);
            }
            else {
                onSuccess();
                // setLoading(false);
            }
        }

        getData();
    }, [workspaceId]);

    return (
        <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            width="100%"
        >
            <CircularProgress />
        </MDBox>
    );

};

export default ProcessData;
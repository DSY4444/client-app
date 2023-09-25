import { useEffect, useState } from "react";
import { useCostExplorerContext } from "context/CostExplorerContext";
import { initExplorer } from "context/CostExplorerContext";
import { CostExplorerContextProvider } from "context/CostExplorerContext";
import useFetchRequest from "hooks/useFetchRequest";
import Header from "./components/Header";
import YASkeleton from "components/YASkeleton";
import MDBox from "components/MDBox";
import AnimatedRoute from "components/AnimatedRoute";
import Viewport from "./components/Viewport";
import fetchRequest from "utils/fetchRequest";
import { setLoading, setMappingData } from "context/CostExplorerContext";
import ErrorBoundary from "components/ErrorBoundary";

const CostExplorer = () => {
    const [viewError, setViewError] = useState(false);
    const [state, dispatch] = useCostExplorerContext();
    const { response, error: requestError, loading } = useFetchRequest(`/api/explorer/categories`);

    useEffect(() => {
        if (!loading && response !== null)
            initExplorer(dispatch, response);

    }, [loading, response]);

    useEffect(() => {
        async function getData(yearFilterVal, monthFilterVal) {
            const [error, data] = await fetchRequest.get(`/api/explorer/data/${yearFilterVal}/${monthFilterVal}`);
            if (error)
                setViewError(error);
            else
                setMappingData(dispatch, data);
            setLoading(dispatch, false);
        }
        setLoading(dispatch, true);
        if (state.headerConfig?.yearFilter && state.headerConfig?.monthFilter) {
            getData(state.headerConfig?.yearFilter, state.headerConfig?.monthFilter)
        }
    }, [state.headerConfig?.yearFilter, state.headerConfig?.monthFilter]);

    if (requestError) {
        throw new Error("Request failed");
    }

    if (loading || state.loading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <MDBox height="calc(100vh - 56px)" display="flex" flexDirection="column">
            <Header />
            <ErrorBoundary page>
                <Viewport error={viewError} />
            </ErrorBoundary>
        </MDBox>
    );
};

const CostExplorerWithContext = () => <CostExplorerContextProvider><CostExplorer /></CostExplorerContextProvider>

export default AnimatedRoute(CostExplorerWithContext);
import { memo, useEffect, useMemo, useState } from "react";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import VisualizationRenderer from "components/VisualizationRenderer";
import { useImmer } from "use-immer";
import { DataFieldTypes } from "../../../../components/DataField";
import VisualizationEmptyState from "./components/VisualizationEmptyState";
import { Card, Icon } from "@mui/material";
import _ from "lodash";
import MDTypography from "components/MDTypography";
import { toInt } from "utils";
import { useAnalyticsContext } from "context/AnalyticsContext";

const DEFAULT_QUERY_TEMPLATE = {
    measures: [], dimensions: [], filters: [], order: [], limit: 10000
};

const DEFAULT_PIVOT_CONFIG_TEMPLATE = {
    x: [], y: ["measures"], fillMissingDates: true, joinDateRange: false
};

const getPivotConfig = (visualizationData) => {
    let pivotConfig = {
        x: [], y: ["measures"], fillMissingDates: true, joinDateRange: false
    };

    if (visualizationData["rows"]) {
        pivotConfig.x = visualizationData.rows?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
    }
    if (visualizationData["columns"]) {
        pivotConfig.y = visualizationData.columns?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
        pivotConfig.y.push("measures");
    }

    return pivotConfig;
};

const getFilters = (visualizationData) => {
    if (visualizationData["filters"]) {
        const filters = visualizationData.filters?.filter(f => ["set", "notSet"].includes(f.operator) || (f.values && f.values.length > 0))?.map(
            f => ({
                member: f.name,
                operator: f.operator,
                values: f.values
            })
        );

        return visualizationData?.filterConditionType === "or" ? [{ "or": filters }] : filters;
    }
    return [];
};

const getOrderDetails = (visualizationData) => {
    if (visualizationData["sort"]) {
        const orderDetails = [];
        visualizationData.sort?.filter(v => !["Years.srl", "Months.srl"].includes(v.name))?.forEach(v => {
            if (v.name === "Months.month")
                orderDetails.push(["Months.srl", v.sortAsc === true ? "asc" : "desc"]);
            else if (v.name === "Years.year")
                orderDetails.push(["Years.srl", v.sortAsc === true ? "asc" : "desc"]);
            else
                orderDetails.push([v.sortName, v.sortAsc === true ? "asc" : "desc"]);
        });
        return orderDetails;
    }
    return [];
};

const getQueryDetails = (chartType, visualizationData) => {
    let dimensions = [], measures = [], pivotConfig = null;
    if (chartType === "table") {
        dimensions = visualizationData.values?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name) || [];
        measures = visualizationData.values?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name) || [];
    }
    else if (chartType === "pivot-table") {
        dimensions = visualizationData.rows?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name) || [];
        const columnDimensions = visualizationData.columns?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
        if (columnDimensions && columnDimensions.length > 0) {
            dimensions.push(...columnDimensions);
        }
        measures = visualizationData.values?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name) || [];
        pivotConfig = getPivotConfig(visualizationData);
    }
    else if (chartType === "stats") {
        dimensions = visualizationData.axis?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name) || [];
        const legendDimensions = visualizationData.legend?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
        if (legendDimensions && legendDimensions.length > 0) {
            dimensions.push(...legendDimensions);
        }
        measures = visualizationData.values?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name) || [];
        const legendMeasures = visualizationData.legend?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name);
        if (legendMeasures && legendMeasures.length > 0) {
            measures.push(...legendMeasures);
        }
        const axisMeasures = visualizationData.axis?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name);
        if (axisMeasures && axisMeasures.length > 0) {
            measures.push(...axisMeasures);
        }
    }
    else if (chartType === "combination-chart") {
        dimensions = visualizationData.axis?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name) || [];
        const legendDimensions = visualizationData.legend?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
        if (legendDimensions && legendDimensions.length > 0) {
            dimensions.push(...legendDimensions);
        }
        measures = visualizationData.values?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name) || [];
        const values1Measures = visualizationData.values1?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name);
        if (values1Measures && values1Measures.length > 0) {
            measures.push(...values1Measures);
        }
    }
    else {
        dimensions = visualizationData.axis?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name) || [];
        const legendDimensions = visualizationData.legend?.filter(v => v.type === DataFieldTypes.DIMENSION)?.map(v => v.name);
        if (legendDimensions && legendDimensions.length > 0) {
            dimensions.push(...legendDimensions);
        }
        measures = visualizationData.values?.filter(v => v.type === DataFieldTypes.MEASURE)?.map(v => v.name) || [];
    }

    // add sort fields into dimensions & measures (if not already present)
    if (visualizationData.sort) {
        const sortMeasures = visualizationData.sort?.filter(v => v.type === DataFieldTypes.MEASURE && !measures.includes(v.name))?.map(v => v.name);
        if (sortMeasures && sortMeasures.length > 0) {
            measures.push(...sortMeasures);
        }
        const sortDimensions = visualizationData.sort?.filter(v => v.type === DataFieldTypes.DIMENSION && !dimensions.includes(v.name))?.map(v => v.name);
        if (sortDimensions && sortDimensions.length > 0) {
            dimensions.push(...sortDimensions);
        }
        // add month and year serial number if month or year dimensions are added
        if (dimensions.includes("Months.month") && !dimensions.includes("Months.srl"))
            dimensions.push("Months.srl");
        if (dimensions.includes("Years.year") && !dimensions.includes("Years.srl"))
            dimensions.push("Years.srl");
    }

    const filters = getFilters(visualizationData);
    const order = getOrderDetails(visualizationData);

    return { dimensions, measures, filters, order, pivotConfig };
};

const getVizConfig = (chartType, query, pivotConfig, visualizationData, chartConfig) => {

    let newQuery = { ...query, ...{ limit: toInt(chartConfig?.top_n || 10000) } };
    let vizState = {
        query: newQuery,
        pivotConfig,
        chartType
    };

    let vizOptions = {};

    if (chartType === "table") {
        vizOptions = {
            columns: visualizationData.values,
            config: chartConfig
        };
    }
    else if (chartType === "pivot-table") {
        vizOptions = {
            columns: [
                ...(visualizationData.rows || []),
                ...(visualizationData.columns || []),
                ...(visualizationData.values || []),
            ],
            config: chartConfig
        };
    }
    else {
        vizOptions = {
            axis: visualizationData.axis,
            legend: visualizationData.legend,
            values: visualizationData.values,
            values1: visualizationData.values1,
            config: chartConfig
        };
    }

    return { vizState, vizOptions };
}

const validateQuery = (chartType, dimensions, measures) => {
    const tableChartType = ["table", "pivot-table"].includes(chartType);
    const dimensionCategories = dimensions?.length > 0 ? _.uniq(dimensions?.map(d => d.split(".")[0])) : [];
    if (tableChartType) {
        if (dimensionCategories?.length > 1 && (!measures || measures?.length === 0)) {
            return ({
                result: false,
                message: "Drag and drop atleast one # measure field to light up your visualization."
            });
        }
    }
    else if (chartType === "sankey-chart" && measures?.length > 0 && dimensions?.length === 0) {
        return ({
            result: false,
            message: "Drag and drop a dimension field to light up your visualization."
        });
    }
    else {
        if (!measures || measures?.length === 0) {
            return ({
                result: false,
                message: "Drag and drop a # measure field to light up your visualization."
            });
        }
    }

    return ({
        result: true,
        message: ""
    });
}

const VisualizationPanel = memo(({ chartType, chartConfig, visualizationData, reRunCode, onQueryChange }) => {
    const [query, setQuery] = useImmer(DEFAULT_QUERY_TEMPLATE);
    const [pivotConfig, setPivotConfig] = useImmer(DEFAULT_PIVOT_CONFIG_TEMPLATE);
    const [emptyState, setEmptyState] = useState(true);
    const [validationMessage, setValidationMessage] = useState(true);
    const { setEnableExport } = useAnalyticsContext();

    useEffect(() => {
        if (Object.keys(visualizationData).length > 0) {
            const { dimensions, measures, filters, order, pivotConfig } = getQueryDetails(chartType, visualizationData);
            setQuery(draft => {
                draft.dimensions = dimensions;
                draft.measures = measures;
                draft.filters = filters;
                draft.order = order;
            });
            setPivotConfig(pivotConfig || DEFAULT_PIVOT_CONFIG_TEMPLATE);

        } else {
            setQuery(DEFAULT_QUERY_TEMPLATE);
            setPivotConfig(DEFAULT_PIVOT_CONFIG_TEMPLATE);
        }
    }, [chartType, visualizationData]);

    useEffect(() => {
        if (query?.dimensions?.length > 0 || query?.measures?.length > 0) {
            const { result, message } = validateQuery(chartType, query?.dimensions, query?.measures);
            if (result) {
                setValidationMessage(null);
            } else {
                setValidationMessage(message);
            }
            setEnableExport(true);
            setEmptyState(false);
        }
        else {
            setEnableExport(false);
            setEmptyState(true);
        }
        if (onQueryChange)
            onQueryChange(getVizConfig(chartType, query, pivotConfig, visualizationData, chartConfig));
    }, [chartType, query, pivotConfig, visualizationData, chartConfig]);

    const { vizState, vizOptions } = useMemo(
        () => {
            if (emptyState)
                return {};
            return getVizConfig(chartType, query, pivotConfig, visualizationData, chartConfig);
        },
        [emptyState, chartType, query, pivotConfig, visualizationData, chartConfig]
    );

    if (emptyState) {
        return <EmptyState
            iconComponent={<VisualizationEmptyState />}
            size="medium"
            variant="secondary"
            iconName="query_stats"
            title={"Drag and drop fields"}
            description={"Select or drag fields from the \"Fields\" pane on to the drop zones to see the changes in visualization."}
        />
    }

    if (validationMessage) {
        return <MDBox
            flex={1}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    p: 2,
                    m: 2,
                    minWidth: 300,
                    maxWidth: "80%",
                    alignItems: 'center',
                    boxShadow: '0 0 1px 1px rgb(35 217 108 / 30%), 0 0 15px 0 rgb(23 54 71 / 20%)'
                }}
            >
                <Icon
                    sx={{
                        height: 30,
                        width: 30,
                        borderRadius: '50%',
                        backgroundColor: '#facd35',
                        pt: .75,
                        mr: 1.75
                    }}
                >lightbulb</Icon>
                <MDTypography fontWeight="medium" variant="button" color="text">{validationMessage}</MDTypography>
            </Card>
        </MDBox>
    }

    return (
        <MDBox flex={1} position="relative" overflow="auto" className="analytics-renderer">
            <VisualizationRenderer key={reRunCode} fluidLayout vizState={vizState} vizOptions={vizOptions} />
        </MDBox>
    )
});

export default VisualizationPanel;
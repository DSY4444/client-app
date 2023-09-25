import MDBox from "components/MDBox";
import { useCallback, useContext, useEffect, useState } from "react";
import PageHeader from "components/PageHeader1";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useParams } from "react-router-dom";
import AnimatedRoute from "components/AnimatedRoute";
import AlertHeader from "./components/AlertHeader";
import VisualizationRenderer from "components/VisualizationRenderer";
import AlertNotificationDetails from "./components/AlertNotificationDetails";
import { parseJsonString } from "utils";
import { applyVariablesToObject } from "utils";
import { monthsArray } from "utils/budget";
import { financialYearStartEndMonthRanges } from "utils/dashboard";
import { yearFinancialNameFormats } from "utils/dashboard";
import { formatAlertMetricValue } from "utils";
import { CubeContext } from "@cubejs-client/react";
import { applyTemplateVariables } from "utils";
import { evaluate } from "mathjs";
import MDTypography from "components/MDTypography";
import AlertRunHistory from "./components/AlertRunHistory";
import { useYADialog } from "components/YADialog";

const getCurrentFinancialYear = (val, startMonth = "Jan") => {
    const startEndMonthRange = financialYearStartEndMonthRanges[startMonth];
    return new Date().getMonth() >= Number(startEndMonthRange[0]) ? Number(val) : Number(val) - 1;
}

const getCurrentFinancialYearName = (val, startMonth, financialYearNameFormat = "fullYear") => {
    if (!val)
        return '';
    return yearFinancialNameFormats[financialYearNameFormat](getCurrentFinancialYear(val, startMonth));
}

const getPrevFinancialYearName = (val, startMonth, financialYearNameFormat = "fullYear") => {
    if (!val)
        return '';
    return yearFinancialNameFormats[financialYearNameFormat](getCurrentFinancialYear(val, startMonth) - 1);
}

const getDefaultVariables = (headerDetails) => {
    return ({
        currentYear: getCurrentFinancialYearName(new Date().getFullYear(), headerDetails.financialYearStartMonth || 'Jan', headerDetails.financialYearNameFormat),
        previousYear: getPrevFinancialYearName(new Date().getFullYear(), headerDetails.financialYearStartMonth || 'Jan', headerDetails.financialYearNameFormat),
        currentMonth: monthsArray[new Date().getMonth()],
        previousMonth: monthsArray[new Date().getMonth() - 1]
    });
};

const parseViewConfig = (headerDetails) => {
    let parsedViewConfig = parseJsonString(headerDetails["metric.config"]);
    let defaultVariables = getDefaultVariables(headerDetails);
    if (parsedViewConfig) {
        parsedViewConfig.display = applyVariablesToObject(parsedViewConfig.display, defaultVariables);
        if (!parsedViewConfig.threshold && headerDetails.triggerConditionType === "THRESHOLD" && !isNaN(headerDetails.thresholdValue)) {
            if (parsedViewConfig?.display?.chart?.vizOptions) {
                parsedViewConfig.display.chart.vizOptions.config = {
                    "refLine_enable": true,
                    "refLine_value": Number(headerDetails.thresholdValue),
                    "refLine_label": `Threshold: ${formatAlertMetricValue(headerDetails.thresholdValue, headerDetails["metric.type"])}`,
                    ...(parsedViewConfig.display.chart.vizOptions.config || {}),
                }
            }
        }
        parsedViewConfig.defaultVariables = defaultVariables;
    }
    // console.log(parsedViewConfig)
    return parsedViewConfig;
};

const normalizeObjKeys = (obj) => {
    let rObj = {};
    Object.keys(obj).forEach((k) => {
        rObj[k.replace(/\./g, '__')] = obj[k];
    });
    return rObj;
}

const getThresholdReturnValue = (thresholdConfig, thresholdResultset) => {
    const { vizOptions } = thresholdConfig
    let thresholdObj = thresholdResultset[0];
    thresholdObj = normalizeObjKeys(thresholdObj);
    const returnValueExpressionStr = applyTemplateVariables(vizOptions.returnValueExpression, thresholdObj);
    return evaluate(returnValueExpressionStr)
};

const applyVariablesToLabel = (vizOptions, thresholdValue) => {
    if (vizOptions.labelTemplate)
        return applyTemplateVariables(vizOptions.labelTemplate, { thresholdValue })

    return `Threshold: ${formatAlertMetricValue(thresholdValue, vizOptions.dataType)}`
};

const setCustomThreshold = (parsedViewConfig, headerDetails, thresholdResultset) => {
    if (thresholdResultset?.length > 0) {
        const thresholdConfig = parsedViewConfig.threshold;
        const thresholdValue = getThresholdReturnValue(thresholdConfig, thresholdResultset);
        if (headerDetails.triggerConditionType === "THRESHOLD" && !isNaN(thresholdValue)) {
            const { vizOptions } = thresholdConfig;
            const refLineLabel = applyVariablesToLabel(vizOptions, thresholdValue);
            if (parsedViewConfig?.display?.chart?.vizOptions) {
                parsedViewConfig.display.chart.vizOptions.config = {
                    "refLine_enable": true,
                    "refLine_value": Number(thresholdValue),
                    "refLine_label": refLineLabel,
                    ...(parsedViewConfig.display.chart.vizOptions.config || {}),
                }
            }
        }
    }
    return parsedViewConfig;
};

const loadThresholdQuery = async (cubejsApi, query, variables) => {
    const newQuery = applyVariablesToObject(query, variables || {});
    try {
        const response = await cubejsApi.load(newQuery);
        return {
            resultSet: response,
            error: null
        };
    } catch (error) {
        return {
            resultSet: null,
            error
        };
    }
}

const AlertDetails = () => {

    const { alertId } = useParams();
    const handleError = useHandleError();
    const [headerDetails, setHeaderDetails] = useState(null);
    const [step, setStep] = useState("LOADING");
    const [viewConfig, setViewConfig] = useState({});
    const [refresh,] = useState(null);
    const { cubejsApi } = useContext(CubeContext);
    const { showCustomForm } = useYADialog();

    useEffect(() => {
        async function getDetails() {
            setStep("LOADING");
            var [err, data] = await fetchRequest.get(`/api/alert/${alertId}`);
            if (err) {
                handleError(err);
            }
            else {
                if (data) {
                    let parsedConfig = parseViewConfig(data);
                    if (parsedConfig?.threshold?.query) {
                        const { resultSet, err } = await loadThresholdQuery(cubejsApi, parsedConfig.threshold.query, parsedConfig.defaultVariables);
                        if (err) {
                            console.error(err);
                        }
                        else {
                            console.log(resultSet?.tablePivot());
                            parsedConfig = setCustomThreshold(parsedConfig, data, resultSet?.tablePivot());
                        }
                    }
                    setViewConfig(parsedConfig);
                    setHeaderDetails(data);
                }
            }
            setStep("LOADED");
        }
        getDetails();
    }, [refresh])

    const handleOnOpenAlertRunHistoryClick = useCallback(
        () => {
            showCustomForm("Alert Run History", () => <AlertRunHistory alertId={alertId} />);
        },
        [alertId]
    );


    if (step === "LOADING") {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const displayConfig = viewConfig.display;

    const getSecondaryActions = () => {
        return [
            { label: "Show run history", onClick: handleOnOpenAlertRunHistoryClick },
        ];
    }

    return (<>
        <PageHeader title={headerDetails?.name} subtitle={headerDetails?.desc} secondaryActions={getSecondaryActions} />
        <MDBox p={3} pt={1} display="flex" gap={4}>
            <MDBox pt={1} flex={1}>
                <AlertHeader headerDetails={headerDetails} />
                {
                    displayConfig && displayConfig.chart && (
                        <MDBox mt={displayConfig.chart.title ? 2 : 4}>
                            {
                                displayConfig.chart.title && (
                                    <MDBox mb={2} px={1} >
                                        <MDTypography fontWeight="medium" variant="caption">{displayConfig.chart.title}</MDTypography>
                                    </MDBox>
                                )
                            }
                            <MDBox height={450}>
                                <VisualizationRenderer vizState={displayConfig.chart.vizState} vizOptions={displayConfig.chart.vizOptions} />
                            </MDBox>
                        </MDBox>
                    )
                }
                {
                    displayConfig && displayConfig.table && (
                        <MDBox mt={2} height={300}>
                            <VisualizationRenderer vizState={displayConfig.table.vizState} vizOptions={displayConfig.table.vizOptions} />
                        </MDBox>
                    )
                }
            </MDBox>
            <MDBox p={3} flexBasis="400px" height="100%" border="1px solid #ddd" borderRadius="8px">
                <AlertNotificationDetails headerDetails={headerDetails} />
            </MDBox>
        </MDBox>
    </>
    );
};

export default AnimatedRoute(AlertDetails);
import { Chip, CircularProgress, Icon } from "@mui/material";
import AnimatedRoute from "components/AnimatedRoute";
import CollapsiblePanel from "components/CollapsiblePanel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useLocation } from "react-router-dom";
import PageHeader from "components/PageHeader";
import { chartTypeSettingDefs } from "components/VisualizationRenderer/components/ChartRenderer/constants";
import { useYADialog } from "components/YADialog";
import YASkeleton from "components/YASkeleton";
import useFetchRequest from "hooks/useFetchRequest";
import useHandleError from "hooks/useHandleError";
import { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { useImmer } from "use-immer";
import fetchRequest from "utils/fetchRequest";
import { DataFieldTypes } from "../../components/DataField";
import DataFieldsPanel from "./components/DataFieldsPanel";
import FiltersPanel from "./components/FiltersPanel";
import SavedReportForm from "./components/SavedReportForm";
import SavedReportsList from "./components/SavedReportsList";
import VisualizationConfigPanel from "./components/VisualizationConfigPanel";
import VisualizationPanel from "./components/VisualizationPanel";
import { AnalyticsContext } from "context/AnalyticsContext";

const parseStringQuery = (queryStr) => {
    try {
        return JSON.parse(queryStr)
    } catch (error) {
        console.error(error);
    }
    return {};
}

const toolbarStyles = () => ({
    "& .MuiTypography-root": {
        cursor: "pointer",
    },
    "& .MuiTypography-root:hover .MuiIcon-root": {
        color: "#facd35"
    }
});

const getConfigItem = (chartType, configType) => {
    const configItems = chartTypeSettingDefs.find(s => s.type === chartType).configItems;
    return configItems?.find(c => c.type === configType) || null;
};

const DEFAULT_QUERY = "{\"chartType\":\"table\",\"chartConfig\":{},\"visualizationData\":{}}";

const Analytics = () => {
    const { cubeId } = useParams();
    const handleError = useHandleError();
    const [selectedFields, setSelectedFields] = useImmer([]);
    const [visualizationData, setVisualizationData] = useImmer({});
    const { response: cubeFetchResponse, error: cubeFetchErr, loading: cubeFetchLoading } = useFetchRequest(`/api/cube/${cubeId}`);
    const { showPrompt, showSnackbar, showCustomForm } = useYADialog();
    const [chartType, setChartType] = useState("table");
    const [chartConfig, setChartConfig] = useImmer({});
    const [savedReportObj, setSavedReportObj] = useState(null);
    const [savingReport, setSavingReport] = useState(false);
    const [savedQuery, setSavedQuery] = useState(DEFAULT_QUERY);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [enableExport, setEnableExport] = useState(false);
    const [queryConfig, setQueryConfig] = useState(false);
    const vizRef = useRef(null);
    const hoverIndex = useRef(null);
    const route = useLocation().pathname.split("/").slice(1);
    const [reRunCode, setReRunCode] = useState();
    let analyticsPageName
    if (route.length > 0) {
        for (let i = 0; i < route.length; i++) {
            let temp = ""
            i++
            let tempText = route[i] ? route[i].split("-") : ''
            for (let j = 0; j < tempText.length; j++) {
                if (tempText[j].length > 3)
                    temp = temp + " " + tempText[j][0].toUpperCase() + tempText[j].slice(1)
                else
                    temp = temp + " " + tempText[j]
            }
            if (i == 1)
                analyticsPageName = temp
            else
                analyticsPageName = analyticsPageName + "\t" + '\t'
        }
    }

    useEffect(() => {
        if (cubeFetchErr) {
            handleError(cubeFetchErr);
        }
    }, [cubeFetchResponse, cubeFetchErr]);

    useEffect(() => {
        const query = JSON.stringify({ chartType, chartConfig, visualizationData });
        setUnsavedChanges(savedQuery !== query);
    }, [chartType, chartConfig, visualizationData]);

    const handleOnSelection = useCallback(
        (item, checked) => {
            let type = "values";
            const graphType = chartType.indexOf("chart") > -1;
            if (chartType === "pivot-table") {
                if (item.type === DataFieldTypes.DIMENSION)
                    type = "rows";
                else
                    type = "values";
            }
            if (chartType === "stats") {
                if (item.type === DataFieldTypes.DIMENSION)
                    type = null;
                else
                    type = "values";
            }
            else if (chartType === "sankey-chart") {
                if (item.type === DataFieldTypes.DIMENSION)
                    type = "axis";
                else
                    type = "values";
            }
            else if (graphType) {
                if (item.type === DataFieldTypes.DIMENSION)
                    type = "axis";
                else
                    type = "values";
            }

            if (type) {
                const configItem = getConfigItem(chartType, type);
                const singleItemConfig = configItem.singleItem || false;

                if (checked) {
                    setVisualizationData(draft => {
                        let visualizationData = draft[type];
                        if (!visualizationData?.find(c => c.name === item.name)) {
                            if (!visualizationData)
                                draft[type] = [];
                            if (singleItemConfig)
                                draft[type] = [item];
                            else
                                draft[type].push(item);
                        }
                    });
                    // setSelectedFields(draft => {
                    //     if (!draft.find(f => f.name === item.name))
                    //         draft.push(item);
                    // });
                    setSelectedFields(draft => {
                        let newArray = [...draft];
                        if (!newArray.find(f => f.name === item.name))
                            newArray.push(item);
                        if (singleItemConfig) {
                            let fieldCopies = 0;
                            const fieldsToUnselect = visualizationData[type]?.map(f => f.name) || [];
                            ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                                if (visualizationData[t] && visualizationData[t].find(c => c.name === fieldsToUnselect[0])) {
                                    fieldCopies = fieldCopies + 1;
                                }
                            });
                            if (fieldsToUnselect?.length > 0 && fieldCopies === 1) {
                                newArray = newArray.filter(f => !fieldsToUnselect.includes(f.name));
                            }
                        }
                        return newArray;
                    });
                } else {
                    setVisualizationData(draft => {
                        ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                            if (draft[t] && draft[t].length > 0)
                                draft[t] = draft[t].filter(c => c.name !== item.name);
                        });
                    });
                    setSelectedFields(draft => {
                        return draft.filter(f => f.name !== item.name);
                    });
                }
            }
        },
        [chartType, visualizationData]
    );

    const resetVisualizationData = useCallback((prevChartType, newChartType) => {
        if (prevChartType === "table" && newChartType === "pivot-table") {
            setVisualizationData(draft => {
                draft.columns = [];
                draft.rows = draft.values?.filter(v => v.type === DataFieldTypes.DIMENSION);
                draft.values = draft.values?.filter(v => v.type === DataFieldTypes.MEASURE);
            });
        }
        else if (prevChartType === "pivot-table" && newChartType === "table") {
            setVisualizationData(draft => {
                let values = [];
                draft.rows?.forEach(item => {
                    if (!values.find(f => f.name === item.name))
                        values.push(item);
                });
                draft.columns?.forEach(item => {
                    if (!values.find(f => f.name === item.name))
                        values.push(item);
                });
                draft.values?.forEach(item => {
                    if (!values.find(f => f.name === item.name))
                        values.push(item);
                });
                draft.values = values;
                draft.columns = [];
                draft.rows = [];
            });
        }
        else if (newChartType === "table") {
            setVisualizationData(draft => {
                let values = [];
                ["rows", "columns", "values", "values1", "axis", "legend"].forEach(type => {
                    draft[type]?.forEach(item => {
                        if (!values.find(f => f.name === item.name))
                            values.push(item);
                    });
                    draft[type] = [];
                });
                draft.values = values;
            });
        }
        else if (newChartType === "pivot-table") {
            setVisualizationData(draft => {
                let rows = [], values = [];
                ["rows", "columns", "values", "values1", "axis", "legend"].forEach(type => {
                    draft[type]?.forEach(item => {
                        if (item.type === DataFieldTypes.MEASURE && !values.find(f => f.name === item.name))
                            values.push(item);
                        else if (item.type === DataFieldTypes.DIMENSION && !rows.find(f => f.name === item.name))
                            rows.push(item);
                    });
                    draft[type] = [];
                });
                draft.values = values;
                draft.rows = rows;
                draft.columns = [];
            });
        }
        else {
            setVisualizationData({});
            setChartConfig({});
            setSelectedFields([]);
            setSavedQuery(DEFAULT_QUERY);
        }
        return {};
    },
        []
    );

    const handleOnFilterConditionTypeChange = (value) => {
        setVisualizationData(draft => {
            draft["filterConditionType"] = value;
        });
    };

    const handleOnChangeChartType = (value) => {
        setChartType(value);
        resetVisualizationData(chartType, value);
        // setVisualizationData({});
        // setSelectedFields([]);
        // setSavedReportObj(null);
        // setUnsavedChanges(false);
    };

    const handleOnChangeChartConfig = (configName, value) => {
        setChartConfig(draft => {
            // remove old config if exists;
            if (draft.config)
                draft.config = undefined;
            draft[configName] = value;
        });
    };

    const handleOnQueryChange = (queryConfig) => {
        setQueryConfig(queryConfig);
    }

    const handleOnFilterDrop = useCallback(
        (item) => {
            setVisualizationData(draft => {
                let filters = draft["filters"];
                if (!filters?.find(c => c.name === item.name)) {
                    if (!filters)
                        draft["filters"] = [];
                    draft["filters"].push(item)
                }
            });
        },
        []
    );

    const handleOnFilterDelete = useCallback(
        (itemName) => {
            setVisualizationData(draft => {
                if (draft["filters"]) {
                    draft["filters"] = draft["filters"].filter(c => c.name !== itemName);
                }
            });
            let fieldCopies = 0;
            ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                if (visualizationData[t] && visualizationData[t].find(c => c.name === itemName)) {
                    fieldCopies = fieldCopies + 1;
                }
            });
            if (fieldCopies === 1) {
                setSelectedFields(draft => {
                    return draft.filter(f => f.name !== itemName);
                });
            }
        },
        [visualizationData]
    );

    const handleOnFilterChange = useCallback(
        (filterName, filter) => {
            setVisualizationData(draft => {
                let filterRef = draft["filters"]?.find(c => c.name === filterName);
                if (filterRef) {
                    filterRef.member = filter.name;
                    filterRef.operator = filter.operator;
                    filterRef.values = filter.values;
                }
            });
        },
        []
    )

    const handleOnFieldSort = useCallback(
        (fieldName) => {
            setVisualizationData(draft => {
                let field = draft["sort"]?.find(f => f.name === fieldName);
                if (field)
                    field.sortAsc = !field.sortAsc;
            });
        },
        []
    );

    const handleOnFieldSettingChange = useCallback(
        (type, fieldName, settingName, settingValue) => {
            setVisualizationData(draft => {
                let field = draft[type]?.find(f => f.name === fieldName);
                if (field)
                    field[settingName] = settingValue;
            });
        },
        []
    );

    const handleOnFieldHover = useCallback(
        (dropType, index) => {
            hoverIndex.current = { dropType, index };
        },
        [hoverIndex]
    );

    const handleOnFieldDrop = useCallback(
        (type, singleItem, item) => {
            if (type) {
                setSelectedFields(draft => {
                    let newArray = [...draft];
                    if (!newArray.find(f => f.name === item.name))
                        newArray.push(item);
                    if (singleItem) {
                        let fieldCopies = 0;
                        const fieldsToUnselect = visualizationData[type]?.map(f => f.name) || [];
                        ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                            if (visualizationData[t] && visualizationData[t].find(c => c.name === fieldsToUnselect[0])) {
                                fieldCopies = fieldCopies + 1;
                            }
                        });
                        if (fieldsToUnselect?.length > 0 && fieldCopies === 1) {
                            newArray = newArray.filter(f => !fieldsToUnselect.includes(f.name));
                        }
                    }
                    return newArray;
                });
                setVisualizationData(draft => {
                    // if dropped from other drop location, delete it from there first
                    if (type !== "sort" && item.dropType !== "sort" && item.dropType && item.dropType !== type) {
                        draft[item.dropType] = draft[item.dropType].filter(c => c.name !== item.name);
                    }

                    let visualizationData = draft[type];
                    if (!visualizationData?.find(c => c.name === item.name)) {
                        if (!visualizationData)
                            draft[type] = [];

                        if (type !== "sort" && singleItem)
                            draft[type] = [{ ...item, ...{ dropType: undefined } }];
                        else {
                            let visItem = null;
                            if (type === "sort") {
                                visItem = { ...item, ...{ sortName: item.sortName || item.name, sortAsc: true, dropType: undefined } };
                            } else {
                                visItem = { ...item, ...{ dropType: undefined } };
                            }

                            if (!isNaN(hoverIndex.current?.index) && hoverIndex.current?.dropType === type) {
                                draft[type].splice(hoverIndex.current.index, 0, visItem);
                            }
                            else {
                                draft[type].push(visItem);
                            }
                        }
                    }
                });
                //reset hoverIndex
                hoverIndex.current = null;
            }
        },
        [visualizationData, hoverIndex]
    );

    const handleOnFieldDelete = useCallback(
        (type, item) => {
            if (type && item) {
                let fieldCopies = 0;
                ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                    if (visualizationData[t] && visualizationData[t].find(c => c.name === item.name)) {
                        fieldCopies = fieldCopies + 1;
                    }
                });
                if (fieldCopies === 1) {
                    setSelectedFields(draft => {
                        return draft.filter(f => f.name !== item.name);
                    });
                }
                setVisualizationData(draft => {
                    if (draft[type]) {
                        draft[type] = draft[type].filter(c => c.name !== item.name);
                    }
                });
            }
        },
        [visualizationData]
    );

    const handleOnFieldMove = useCallback(
        (type, field, fromIndex, toIndex) => {
            if (fromIndex !== undefined && toIndex !== undefined) {
                setVisualizationData(draft => {
                    if (type === field.dropType && draft[type]) {
                        const element = draft[type].splice(fromIndex, 1)[0];
                        draft[type].splice(toIndex, 0, element);
                    }
                });
            }
        },
        []
    );

    const handleOnRunReportClick = useCallback(
        () => {
            setReRunCode(Math.random());
        },
        []
    );

    const handleOnNewReportClick = useCallback(
        () => {
            showPrompt("New Report", "This action will discard any changes that haven't been saved.  Are you sure you want to proceed?",
                () => {
                    setChartType("table");
                    setVisualizationData({});
                    setChartConfig({});
                    setSelectedFields([]);
                    setSavedQuery(DEFAULT_QUERY);
                    setSavedReportObj(null);
                    setUnsavedChanges(false);
                }
            );
        },
        []
    );

    const handleSaveReportClose = useCallback(
        (obj) => {
            setSavedReportObj(obj);
            const query = JSON.stringify({ chartType, chartConfig, visualizationData });
            setSavedQuery(query);
            setUnsavedChanges(false);
        },
        [setSavedReportObj, chartType, chartConfig, visualizationData]
    );

    const getQueryDetails = () => {
        return {
            chartType,
            chartConfig,
            visualizationData
        };
    }

    const getQueryConfig = () => {
        return {
            ...queryConfig,
            filters: visualizationData["filters"] || [],
            filterConditionType: visualizationData["filterConditionType"] || "and"
        };
    };

    const saveQuery = async (reportId) => {
        setSavingReport(true);
        const formdata = { query: getQueryDetails(), config: getQueryConfig() };
        const [error, data] = await fetchRequest.post(`/api/cube/report/${reportId}`, JSON.stringify(formdata));
        if (data && data.result === true) {
            showSnackbar(data.message, "success");
            const query = JSON.stringify({ chartType, chartConfig, visualizationData });
            setSavedQuery(query);
            setUnsavedChanges(false);
        }
        else {
            console.error(error);
        }
        setSavingReport(false);
    }

    const handleOnReportSaveClick = useCallback(
        () => {
            if (!savedReportObj || !savedReportObj.reportId)
                showCustomForm("Save Report", () => <SavedReportForm cubeId={cubeId} query={getQueryDetails()} config={getQueryConfig()} onClose={handleSaveReportClose} />, null, null, null, 'sm');
            else
                saveQuery(savedReportObj.reportId)
        },
        [cubeId, savedReportObj, chartType, chartConfig, queryConfig, visualizationData]
    );

    const handleOnDiscardClick = useCallback(
        () => {
            setUnsavedChanges(false);
            const query = parseStringQuery(savedQuery);
            const vizData = query["visualizationData"] || {}
            setChartType(query["chartType"] || "table");
            setChartConfig(query["chartConfig"] || {});
            setVisualizationData(query["visualizationData"] || {});
            setSelectedFields([]);
            setSelectedFields(draft => {
                if (vizData && Object.keys(vizData).length > 0) {
                    ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                        const data = vizData[t];
                        if (data && data.length > 0) {
                            data?.map(item => {
                                if (!draft.find(f => f.name === item.name))
                                    draft.push(item);
                            });
                        }
                    });
                }
            });
        },
        [cubeId, savedQuery, setChartType, setChartConfig, setVisualizationData, setSelectedFields]
    );

    const handleOnReportSaveAsClick = () => {
        showCustomForm("Save Report As", () => <SavedReportForm cubeId={cubeId} query={getQueryDetails()} config={getQueryConfig()} onClose={handleSaveReportClose} />, null, null, null, 'sm');
    };

    const handleOnOpenReport = useCallback(
        (obj) => {
            setSavedReportObj({ reportId: obj.reportId, reportName: obj.reportName });
            if (obj.query) {
                setSavedQuery(obj.query || "");
                setUnsavedChanges(false);
                const query = parseStringQuery(obj.query);
                const vizData = query["visualizationData"] || {}
                setChartType(query["chartType"] || "table");
                setChartConfig(query["chartConfig"] || {});
                setVisualizationData(query["visualizationData"] || {});
                setSelectedFields([]);
                setSelectedFields(draft => {
                    if (vizData && Object.keys(vizData).length > 0) {
                        ["rows", "columns", "values", "values1", "sort", "filters", "axis", "legend"].forEach(t => {
                            const data = vizData[t];
                            if (data && data.length > 0) {
                                data?.map(item => {
                                    if (!draft.find(f => f.name === item.name))
                                        draft.push(item);
                                });
                            }
                        });
                    }
                });
            }
        },
        [cubeId]
    );

    const handleOnOpenReportClick = useCallback(
        () => {
            showCustomForm("Saved Reports", () => <SavedReportsList cubeId={cubeId} onOpenReport={handleOnOpenReport} />);
        },
        [cubeId]
    );

    const handleOnExportClick = () => {
        vizRef.current?.export();
    }

    const renderActions = () => (
        <MDBox sx={theme => toolbarStyles(theme)} display="flex" alignItems="flex-end" height="100%" mr={3}>
            {
                unsavedChanges && <MDBox display="flex" alignItems="center" mr={4}>
                    <Chip data-testid = {"You have unsaved changes".toLowerCase().replaceAll(' ', '')}icon={<Icon fontSize="medium">info</Icon>} color="info" label="You have unsaved changes" size="small"></Chip>
                    {savingReport && <>
                        <CircularProgress size={15} sx={{ ml: 2 }} />
                        <MDTypography data-testid = {"Saving..".toLowerCase().replaceAll(' ', '')} mx={1} variant="caption" fontWeight="medium" color="text">Saving..</MDTypography>
                    </>
                    }
                    {!savingReport && <>
                        <MDTypography data-testid = {"SAVE".toLowerCase().replaceAll(' ', '')} mx={2} variant="caption" fontWeight="medium" color="text" onClick={handleOnReportSaveClick}>SAVE</MDTypography>
                        <MDTypography data-testid = {"DISCARD".toLowerCase().replaceAll(' ', '')} variant="caption" fontWeight="medium" color="error" onClick={handleOnDiscardClick}>DISCARD</MDTypography>
                    </>
                    }
                </MDBox>
            }
            {
                selectedFields?.length > 0 &&
                <MDTypography data-testid = {"Run Report".toLowerCase().replaceAll(' ', '')} mr={2} display="flex" alignItems="center" component="a" onClick={handleOnRunReportClick} variant="button" color="dark" fontWeight="regular">
                    <Icon color="dark" sx={{ fontSize: "24px!important" }}>play_circle</Icon>&nbsp;Run Report
                </MDTypography>
            }
            <MDTypography  data-testid = {"New".toLowerCase().replaceAll(' ', '')} display="flex" alignItems="center" component="a" onClick={handleOnNewReportClick} variant="button" color="dark" fontWeight="regular">
                <Icon color="dark" sx={{ fontSize: "24px!important" }}>note_add</Icon>&nbsp;New
            </MDTypography>
            <MDTypography data-testid = {"Open".toLowerCase().replaceAll(' ', '')} ml={2} display="flex" alignItems="center" component="a" onClick={handleOnOpenReportClick} variant="button" color="dark" fontWeight="regular">
                <Icon color="dark" sx={{ fontSize: "24px!important" }}>folder</Icon>&nbsp;Open
            </MDTypography>
            {
                (savedReportObj && savedReportObj.reportId) &&
                <MDTypography data-testid = {"Save As".toLowerCase().replaceAll(' ', '')} ml={2} display="flex" alignItems="center" component="a" onClick={handleOnReportSaveAsClick} variant="button" color="dark" fontWeight="regular">
                    <Icon color="dark" sx={{ fontSize: "24px!important" }}>save_as</Icon>&nbsp;Save As
                </MDTypography>
            }
            {
                enableExport &&
                <MDTypography data-testid = {"Export".toLowerCase().replaceAll(' ', '')} ml={2} display="flex" alignItems="center" component="a" onClick={handleOnExportClick} variant="button" color="dark" fontWeight="regular">
                    <Icon color="dark" sx={{ fontSize: "24px!important" }}>download</Icon>&nbsp;Export
                </MDTypography>
            }
        </MDBox>
    )

    const contextValue = { vizRef, setEnableExport };

    if (cubeFetchLoading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    return (
        <AnalyticsContext.Provider value={contextValue}>
            <PageHeader title={`${analyticsPageName} ${savedReportObj ? `(${savedReportObj.reportName})` : ""}`} subtitle="Discover, interpret, and communicate significant patterns in data" primaryActionComponent={renderActions} />
            <DndProvider backend={HTML5Backend}>
                <MDBox width="100%" height="calc(100vh - 156px)" px={2.25}>
                    <MDBox borderRadius="6px" border="1px solid #ddd" width="100%" height="100%" display="flex" overflow="hidden">
                        <CollapsiblePanel width={260} title="Fields">
                            <DataFieldsPanel cubes={cubeFetchResponse} selectedFields={selectedFields} onSelection={handleOnSelection} />
                        </CollapsiblePanel>
                        <CollapsiblePanel width={260} title="Visualization">
                            <VisualizationConfigPanel chartType={chartType} chartConfig={chartConfig} visualizationData={visualizationData} onChange={handleOnChangeChartType} onHover={handleOnFieldHover} onDrop={handleOnFieldDrop} onDelete={handleOnFieldDelete} onMove={handleOnFieldMove} onFieldSort={handleOnFieldSort} onFieldSettingChange={handleOnFieldSettingChange} onConfigChange={handleOnChangeChartConfig} />
                        </CollapsiblePanel>
                        <CollapsiblePanel width={280} title="Filters" initialCollapse={true}>
                            <FiltersPanel filters={visualizationData.filters} filterConditionType={visualizationData.filterConditionType} onFilterConditionTypeChange={handleOnFilterConditionTypeChange} onFilterDrop={handleOnFilterDrop} onFilterDelete={handleOnFilterDelete} onFilterChange={handleOnFilterChange} />
                        </CollapsiblePanel>
                        <VisualizationPanel chartType={chartType} chartConfig={chartConfig} visualizationData={visualizationData} reRunCode={reRunCode} onQueryChange={handleOnQueryChange} />
                    </MDBox>
                </MDBox>
            </DndProvider>
        </AnalyticsContext.Provider>
    )
};

export default AnimatedRoute(Analytics)
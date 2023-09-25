import { memo, useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { Icon, IconButton, Stack } from "@mui/material";
import EmptyState from "components/EmptyState";
import { chartTypeSettingDefs } from "components/VisualizationRenderer/components/ChartRenderer/constants";
import ConfigSection from "components/ConfigSection";
import CubeFilter from "components/CubeFilter";
import ErrorBoundary from "components/ErrorBoundary";
import MDTypography from "components/MDTypography";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            style={{ height: "100%", width: "100%" }}
        >
            {value === index && (
                <MDBox height="100%" width="100%" {...other}>
                    {children}
                </MDBox>
            )}
        </div>
    );
}

const tabIconStyles = ({ palette: { text, info } }, { selected, rotate }) => ({
    color: selected ? text.main : "#a3a3a3",
    "& .MuiIcon-root": {
        fontSize: "18px!important",
        transform: rotate ? "rotateZ(90deg)" : "none"
    },
    "&::after": selected ? {
        content: '""',
        position: "absolute",
        bottom: -4,
        height: 6,
        width: "90%",
        borderRadius: "6px",
        backgroundColor: info.main
    } : {}
});

const WidgetConfigPanel = memo(({ selectedWidget, onConfigChange, onFilterChange }) => {
    const chartType = selectedWidget.vizState?.chartType;
    const chartConfig = selectedWidget.vizOptions?.config;
    const chartFilters = selectedWidget.filters || [];
    const filterConditionType = selectedWidget.filterConditionType || "and";

    const [vizConfig, setVizConfig] = useState(chartConfig);
    const [tabValue, setTabValue] = useState(0);
    const selectedChartType = chartTypeSettingDefs?.find(c => c.type === chartType);

    useEffect(() => {
        setTabValue(0);
    }, [chartType])

    useEffect(() => {
        setVizConfig(chartConfig);
    }, [chartConfig])

    const handleChange = (newValue) => {
        setTabValue(newValue);
    }

    const handleConfigChange = (configName, value) => {
        if (onConfigChange)
            onConfigChange(configName, value);
    }

    const handleFilterChange = (filterName, filterObj) => {
        if (onFilterChange)
            onFilterChange(filterName, filterObj?.operator, filterObj?.values);
    }

    return (
        <ErrorBoundary>
            <MDBox>
                <Stack direction="row" justifyContent="center" spacing={1.5} marginTop={2}>
                    <IconButton size="medium" sx={theme => tabIconStyles(theme, { selected: tabValue === 0, rotate: true })} onClick={() => handleChange(0)}>
                        <Icon>settings</Icon>
                    </IconButton>
                    <IconButton size="medium" sx={theme => tabIconStyles(theme, { selected: tabValue === 1 })} onClick={() => handleChange(1)}>
                        <Icon>filter_alt</Icon>
                    </IconButton>
                </Stack>
                <TabPanel value={tabValue} index={0}>
                    <MDBox py={1.5}>
                        {
                            selectedChartType?.settingItems?.map(i => {
                                return <ConfigSection key={`${chartType}_${i.title}`} type={i.type} title={i.title} name={i.name} config={vizConfig} settings={i.settings} onSettingChange={handleConfigChange} />
                            })
                        }
                    </MDBox>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {
                        chartFilters && chartFilters?.length > 0 &&
                        <MDBox component="ul" py={2} px={1}>
                            {
                                chartFilters.map((f, i) =>
                                    <>
                                        <CubeFilter key={f.name} dismissible={false} filterDef={f} onFilterChange={handleFilterChange} />
                                        {
                                            chartFilters.length !== i + 1 &&
                                            <MDBox key={f.name} component="li" sx={{listStyle: "none", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                <MDTypography my={.75} variant="caption" fontWeight="medium">{filterConditionType === "or" ? "Or" : "And"}</MDTypography>
                                            </MDBox>
                                        }
                                    </>
                                )
                            }
                        </MDBox>
                    }
                    {
                        (!chartFilters || chartFilters?.length === 0) &&
                        <MDBox height="80vh" flex={1} display="flex" alignItems="center" justifyContent="center">
                            <EmptyState
                                size="medium"
                                iconName="filter_alt"
                                description={"No Filters Found"}
                                variant="text"
                            />
                        </MDBox>
                    }
                </TabPanel>
            </MDBox>
        </ErrorBoundary>
    );
});

export default WidgetConfigPanel;
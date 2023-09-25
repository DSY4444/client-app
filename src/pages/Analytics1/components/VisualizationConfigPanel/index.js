import { Icon, IconButton, Stack } from "@mui/material";
import MDBox from "components/MDBox";
import { memo, useEffect, useMemo, useState } from "react";
import ConfigSection from "components/ConfigSection";
import DataFieldDropbox from "../DataFieldDropbox";
import ChartTypesDropdown from "./components/ChartTypesDropdown";
import { chartTypeSettingDefs } from "components/VisualizationRenderer/components/ChartRenderer/constants";

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

const VisualizationConfigPanel = memo(({ chartType, chartConfig, visualizationData, onChange, onHover, onDrop, onDelete, onMove, onFieldSort, onFieldSettingChange, onConfigChange }) => {
    const [vizConfig, setVizConfig] = useState(chartConfig);
    const [tabValue, setTabValue] = useState(0);
    const chartTypes = useMemo(() => chartTypeSettingDefs.filter(ct => ct.category !== "editor"), []);
    const selectedChartType = chartTypes?.find(c => c.type === chartType);

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

    return (
        <MDBox>
            <ChartTypesDropdown value={chartType} chartTypes={chartTypes} onChange={onChange} />
            <Stack direction="row" justifyContent="center" spacing={1.5} marginTop={2}>
                <IconButton size="medium" sx={theme => tabIconStyles(theme, { selected: tabValue === 0, rotate: true })} onClick={() => handleChange(0)}>
                    <Icon>view_week</Icon>
                </IconButton>
                <IconButton size="medium" sx={theme => tabIconStyles(theme, { selected: tabValue === 1 })} onClick={() => handleChange(1)}>
                    <Icon>settings</Icon>
                </IconButton>
            </Stack>
            <TabPanel value={tabValue} index={0}>
                <MDBox py={1.5}>
                    {
                        selectedChartType?.configItems?.map(i => {
                            const fields = visualizationData[i.type] || [];
                            return <DataFieldDropbox key={`${chartType}_${i.type}`} type={i.type} title={i.title} accept={i.accept} singleItem={i.singleItem || false} fields={fields} onHover={onHover} onDrop={onDrop} onDelete={onDelete} onMove={onMove} onFieldSettingChange={onFieldSettingChange} onFieldSort={onFieldSort} />
                        })
                    }
                </MDBox>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <MDBox py={1.5}>
                    {
                        selectedChartType?.settingItems?.filter(i => (i.category || "") !== "editor")?.map(i => {
                            return <ConfigSection key={`${chartType}_${i.title}`} hideEditorSettings type={i.type} chartType={chartType} title={i.title} name={i.name} config={vizConfig} settings={i.settings} onSettingChange={handleConfigChange} />
                        })
                    }
                </MDBox>
            </TabPanel>
        </MDBox >
    )
});

export default VisualizationConfigPanel;


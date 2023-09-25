import { Accordion, AccordionDetails, AccordionSummary, Icon, List, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { memo, useState } from "react";
import DataField, { DataFieldTypes } from "../../../../components/DataField";

const fieldsListStyles = (theme) => {
    const { palette, functions, borders } = theme;
    const { black } = palette;
    const { pxToRem, rgba } = functions;
    const { borderWidth } = borders;
    return {
        boxShadow: "none",
        "&::before": {
            height: 0
        },
        "& .MuiListItem-root": {
            cursor: 'grab',
            userSelect: 'none',
            border: `${borderWidth[1]} solid transparent`,
        },
        "& .MuiListItem-root:hover": {
            borderRadius: pxToRem(4),
            backgroundColor: '#facd35',
            // backgroundColor: info.main,
            // color: white.main,
            border: `${borderWidth[1]} solid ${rgba(black.main, 0.09)}`,

        },
        "& .MuiListItem-root .dragIcon": {
            visibility: 'hidden'
        },
        "& .MuiListItem-root:hover .dragIcon": {
            visibility: 'visible'
        },
        "& .MuiListItem-root:hover .MuiTypography-root, & .MuiListItem-root:hover .MuiIcon-root": {
            color: black.main
        },
        "& .MuiListItem-root:hover .MuiCheckbox-root .MuiSvgIcon-root": {
            border: `${borderWidth[1]} solid ${black.main}`,
        },
        "& .MuiListItemIcon-root": {
            minWidth: pxToRem(20),
            margin: `${pxToRem(4)} ${pxToRem(8)}`
        },
        "& .MuiAccordionDetails-root": {
            padding: `0 ${pxToRem(8)} 0 ${pxToRem(8)}`
        },
        "& .MuiAccordionSummary-content": {
            margin: `${pxToRem(8)} 0`
        },
        "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: pxToRem(8)
        },
        "& .MuiAccordionSummary-root.Mui-expanded": {
            minHeight: pxToRem(32)
        },
        "& + .Mui-expanded": {
            margin: `0 0 ${pxToRem(8)} 0`
        },
        "& .MuiAccordionSummary-content.Mui-expanded": {
            margin: 0
        },
        "& .MuiAccordionSummary-root": {
            padding: `0 ${pxToRem(8)} 0 ${pxToRem(16)}`,
            minHeight: pxToRem(32),
            flexDirection: "row-reverse"
        }
    };
};

const DataFieldsPanel = memo(({ cubes, selectedFields, onSelection }) => {
    const [searchText, setSearchText] = useState("");
    const selectedFieldNames = selectedFields?.map(f => f.name);

    const renderCubeFields = (cubeName, dimensions, measures) => {
        return <List key={`${cubeName}_l`} dense>
            {
                dimensions?.map(d => (
                    <DataField key={`${d.cubeName || cubeName}_${d.name}_d`} type={DataFieldTypes.DIMENSION} name={`${d.cubeName || cubeName}.${d.name}`} title={d.title} dataType={d.type} isDropped={selectedFieldNames?.includes(`${d.cubeName || cubeName}.${d.name}`)} onSelection={onSelection} />
                ))
            }
            {
                measures?.map(m => (
                    <DataField key={`${m.cubeName || cubeName}_${m.name}_m`} hideTotal = {m.hideTotal} type={DataFieldTypes.MEASURE} name={`${m.cubeName || cubeName}.${m.name}`} title={m.title} dataType={m.type} decimalPoints={m.decimalPoints}  isDropped={selectedFieldNames?.includes(`${m.cubeName || cubeName}.${m.name}`)} onSelection={onSelection} />
                ))
            }
        </List>
    };

    return (
        <MDBox position="relative" pb={2}>
            <MDBox sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff!important", px: 2, pb: 1 }}>
                <TextField
                    value={searchText || ""}
                    fullWidth
                    size="small"
                    variant="outlined"
                    inputProps={{ type: "search" }}
                    placeholder="Type to filter.."
                    onChange={({ target: { value } }) => setSearchText(value)}
                    onBlur={({ target: { value } }) => setSearchText(value?.trim())}
                    onFocus={({ target }) => { target.select() }}
                />
            </MDBox>
            {
                cubes && Object.keys(cubes)?.map(ck => {
                    const c = cubes[ck];
                    const filteredDimensions = c.dimensions?.filter(d => searchText?.trim() === "" || d.title.toLowerCase().indexOf(searchText?.trim().toLowerCase()) > -1);
                    const filteredMeasures = c.measures?.filter(m => searchText?.trim() === "" || m.title.toLowerCase().indexOf(searchText?.trim().toLowerCase()) > -1);
                    if (filteredDimensions?.length > 0 || filteredMeasures?.length > 0) {
                        if (searchText?.trim() !== "") {
                            return <Accordion key={`${c.name}_e`} expanded={true} sx={(theme) => fieldsListStyles(theme)}>
                                <AccordionSummary expandIcon={<Icon>keyboard_arrow_down</Icon>}>
                                    <MDTypography data-testid = {c.title?.toLowerCase().replaceAll(' ', '')} variant="caption" color="text" fontWeight="medium">{c.title}</MDTypography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {renderCubeFields(c.name, filteredDimensions, filteredMeasures)}
                                </AccordionDetails>
                            </Accordion>
                        }
                        return <Accordion key={`${c.name}_ne`} defaultExpanded={false} sx={(theme) => fieldsListStyles(theme)}>
                            <AccordionSummary expandIcon={<Icon>keyboard_arrow_down</Icon>}>
                                <MDTypography data-testid = {c.title?.toLowerCase().replaceAll(' ', '')} variant="caption" color="text" fontWeight="medium">{c.title}</MDTypography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderCubeFields(c.name, filteredDimensions, filteredMeasures)}
                            </AccordionDetails>
                        </Accordion>
                    }
                    return <span key={`${c.name}_em`}></span>
                })
            }
        </MDBox >
    )
});

export default DataFieldsPanel;
import { Icon, MenuItem, Select, SvgIcon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { memo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { toInt } from "utils";

const TextSortIcon = (props) => {
    return props.sortAsc ?
        <MDBox component="p" title={props.title} display="inherit" m={0}>
            <SvgIcon viewBox="0 0 32 32" {...props}>
                <path d="M 8.1875 5 L 7.96875 5.65625 L 6.03125 11 L 6 11 L 6 11.0625 L 5.0625 13.65625 L 5 13.8125 L 5 15 L 7 15 L 7 14.15625 L 7.40625 13 L 10.59375 13 L 11 14.15625 L 11 15 L 13 15 L 13 13.8125 L 12.9375 13.65625 L 12 11.0625 L 12 11 L 11.96875 11 L 10.03125 5.65625 L 9.8125 5 Z M 22 5 L 22 23.6875 L 19.40625 21.09375 L 18 22.5 L 22.28125 26.8125 L 23 27.5 L 23.71875 26.8125 L 28 22.5 L 26.59375 21.09375 L 24 23.6875 L 24 5 Z M 9 8.65625 L 9.84375 11 L 8.15625 11 Z M 5 17 L 5 19 L 10.5625 19 L 5.28125 24.28125 L 5 24.59375 L 5 27 L 13 27 L 13 25 L 7.4375 25 L 12.71875 19.71875 L 13 19.40625 L 13 17 Z" />
            </SvgIcon>
        </MDBox>
        :
        <MDBox component="p" title={props.title} display="inherit" m={0}>
            <SvgIcon viewBox="0 0 32 32" {...props}>
                <path d="M 5 5 L 5 7 L 10.5625 7 L 5.28125 12.28125 L 5 12.59375 L 5 15 L 13 15 L 13 13 L 7.4375 13 L 12.71875 7.71875 L 13 7.40625 L 13 5 Z M 22 5 L 22 23.6875 L 19.40625 21.09375 L 18 22.5 L 22.28125 26.8125 L 23 27.5 L 23.71875 26.8125 L 28 22.5 L 26.59375 21.09375 L 24 23.6875 L 24 5 Z M 8.1875 17 L 7.96875 17.65625 L 6.03125 23 L 6 23 L 6 23.0625 L 5.0625 25.65625 L 5 25.8125 L 5 27 L 7 27 L 7 26.15625 L 7.40625 25 L 10.59375 25 L 11 26.15625 L 11 27 L 13 27 L 13 25.8125 L 12.9375 25.65625 L 12 23.0625 L 12 23 L 11.96875 23 L 10.03125 17.65625 L 9.8125 17 Z M 9 20.65625 L 9.84375 23 L 8.15625 23 Z" />
            </SvgIcon>
        </MDBox>
};

const NumericSortIcon = (props) => {
    return props.sortAsc ?
        <MDBox component="p" title={props.title} display="inherit" m={0}>
            <SvgIcon viewBox="0 0 32 32" {...props}>
                <path d="M 8.59375 5 L 8.4375 5.78125 C 8.4375 5.78125 8.273438 6.355469 7.875 6.9375 C 7.476563 7.519531 6.980469 8 6 8 L 6 10 C 7.375 10 8.320313 9.324219 9 8.59375 L 9 15 L 11 15 L 11 5 Z M 22 5 L 22 23.6875 L 19.40625 21.09375 L 18 22.5 L 22.28125 26.8125 L 23 27.5 L 23.71875 26.8125 L 28 22.5 L 26.59375 21.09375 L 24 23.6875 L 24 5 Z M 8.5 17 C 6.578125 17 5 18.578125 5 20.5 L 5 21 L 7 21 L 7 20.5 C 7 19.625 7.625 19 8.5 19 L 9.5 19 C 10.375 19 11 19.625 11 20.5 C 11 20.957031 10.648438 21.480469 10.0625 21.84375 C 8.828125 22.601563 7.746094 23.085938 6.84375 23.59375 C 6.390625 23.847656 5.976563 24.089844 5.625 24.46875 C 5.273438 24.847656 5 25.417969 5 26 L 5 27 L 13 27 L 13 25 L 8.4375 25 C 9.171875 24.621094 10.019531 24.242188 11.125 23.5625 C 12.140625 22.925781 13 21.84375 13 20.5 C 13 18.578125 11.421875 17 9.5 17 Z" />
            </SvgIcon>
        </MDBox>
        :
        <MDBox component="p" title={props.title} display="inherit" m={0}>
            <SvgIcon viewBox="0 0 32 32" {...props}>
                <path d="M 8.5 5 C 6.578125 5 5 6.578125 5 8.5 L 5 9 L 7 9 L 7 8.5 C 7 7.625 7.625 7 8.5 7 L 9.5 7 C 10.375 7 11 7.625 11 8.5 C 11 8.957031 10.648438 9.480469 10.0625 9.84375 C 8.828125 10.601563 7.746094 11.085938 6.84375 11.59375 C 6.390625 11.847656 5.976563 12.089844 5.625 12.46875 C 5.273438 12.847656 5 13.417969 5 14 L 5 15 L 13 15 L 13 13 L 8.4375 13 C 9.171875 12.621094 10.019531 12.242188 11.125 11.5625 C 12.140625 10.925781 13 9.84375 13 8.5 C 13 6.578125 11.421875 5 9.5 5 Z M 22 5 L 22 23.6875 L 19.40625 21.09375 L 18 22.5 L 22.28125 26.8125 L 23 27.5 L 23.71875 26.8125 L 28 22.5 L 26.59375 21.09375 L 24 23.6875 L 24 5 Z M 8.59375 17 L 8.4375 17.78125 C 8.4375 17.78125 8.273438 18.355469 7.875 18.9375 C 7.476563 19.519531 6.980469 20 6 20 L 6 22 C 7.375 22 8.320313 21.324219 9 20.59375 L 9 27 L 11 27 L 11 17 Z" />
            </SvgIcon>
        </MDBox>
};

const dataFieldStyles = ({ palette: { black, info }, functions: { rgba }, borders: { borderWidth } }, { isOver, newItem, append }) => ({
    cursor: "grab",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    p: .5,
    marginTop: .5,
    borderRadius: .75,
    backgroundColor: `${rgba(black.main, 0.05)}!important`,
    border: `${borderWidth[1]} solid ${rgba(black.main, 0.09)}`,
    borderTop: isOver && (!append || newItem) ? `${borderWidth[2]} solid ${info.main}` : `${borderWidth[1]} solid ${rgba(black.main, 0.09)}`,
    borderBottom: isOver && append && !newItem ? `${borderWidth[2]} solid ${info.main}` : `${borderWidth[1]} solid ${rgba(black.main, 0.09)}`,
    "& .fieldSection": {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    "& .fieldSection .fieldSection_title": {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    "& .fieldSection .fieldSection_actions": {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    "& .settingSection": {
        p: .5,
        mt: 1,
        borderRadius: .75,
        backgroundColor: '#ffffff',
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    "& .sortIcon": {
        cursor: "pointer",
        height: 22,
        width: 22,
        fontSize: "21px!important",
        color: "#212121",
        borderRadius: .5,
        border: `${borderWidth[1]} solid ${rgba(black.main, 0.2)}`,
        transform: "rotateX(-180deg)",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
    "& .desc": {
        transform: "rotateX(0deg)"
    },
    "& .textSortIcon": {
        cursor: "pointer",
        height: 22,
        width: 22,
        borderRadius: .5,
        border: `${borderWidth[1]} solid ${rgba(black.main, 0.2)}`,
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
    "& .MuiTypography-root": {
        ml: .5,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    "& .settingIcon": {
        cursor: "pointer",
        pt: "3px",
        height: 20,
        width: 22,
        fontSize: "18px!important",
        ml: "auto",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
    "& .deleteIcon": {
        cursor: "pointer",
        pt: "3px",
        height: 20,
        width: 22,
        fontSize: "16px!important",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08)"
        }
    },
});

const DataFieldChip = memo(({ index, dropType, accept, field, onDelete, onMove, onFieldSettingChange, onFieldSort, onHover }) => {

    const [toggle, setToggle] = useState(false);

    const ref = useRef(null);

    const [, drag] = useDrag({
        item: {
            dropType: dropType,
            type: field.type,
            name: field.name,
            title: field.title,
            dataType: field.dataType,
            decimalPoints: field.decimalPoints,
            index
        }
    },
        [dropType, field.name, field.title, field.type, field.dataType, field.decimalPoints],
    )

    const [{ isOver, dragItem, clientOffsetChange }, drop] = useDrop({
        accept,
        drop: (item) => {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            // current element where the dragged element is hovered on
            const hoverIndex = index;
            // If the dragged element is hovered in the same place, then do nothing
            if (dragIndex === hoverIndex) {
                return;
            }
            //store hoverIndex
            onHover(dropType, hoverIndex);
            // If it is dragged around other elements, then move the image and set the state with position changes
            onMove(dropType, item, dragIndex, hoverIndex);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            dragItem: monitor.getItem(),
            clientOffsetChange: monitor.getDifferenceFromInitialOffset()
        })
    });

    drag(drop(ref));

    const isDecimalField = dropType !== "sort" && ["decimal", "currency"].includes(field.dataType)

    return (
        <MDBox ref={ref} sx={theme => dataFieldStyles(theme, { isOver, newItem: (dragItem?.dropType || '') === '', append: clientOffsetChange && clientOffsetChange.y > 0 })}>
            <MDBox className="fieldSection">
                <MDBox className="fieldSection_title">
                    {dropType === "sort" &&
                        <>
                            {
                                field.dataType === "string" &&
                                <TextSortIcon sortAsc={field.sortAsc} title={`Click to sort ${field.sortAsc ? "descending" : "ascending"}`} className="textSortIcon" onClick={() => onFieldSort(field.name)}></TextSortIcon>
                            }
                            {
                                (field.dataType !== "string") &&
                                <NumericSortIcon sortAsc={field.sortAsc} title={`Click to sort ${field.sortAsc ? "descending" : "ascending"}`} className="textSortIcon" onClick={() => onFieldSort(field.name)}></NumericSortIcon>
                            }
                        </>
                    }
                    <MDTypography  data-testid = {field.title?.toLowerCase().replaceAll(' ', '')} variant="caption">{field.title }</MDTypography>
                </MDBox>
                <MDBox className="fieldSection_actions">
                    {isDecimalField && <Icon title="Click for more details" className="settingIcon" onClick={() => { setToggle(prev => !prev) }}>{toggle ? "keyboard_arrow_up" : "keyboard_arrow_down"}</Icon>}
                    <Icon title="Click to delete" color="error" className="deleteIcon" onClick={() => onDelete(dropType, field)}>delete</Icon>
                </MDBox>
            </MDBox>
            {
                isDecimalField && toggle && <MDBox className="settingSection">
                    <MDTypography variant="caption">No. of decimal places</MDTypography>
                    <Select
                        value={field.decimalPoints || "0"}
                        onChange={(event) => {
                            onFieldSettingChange(dropType, field.name, 'decimalPoints', toInt(event.target.value));
                        }}
                        size="small"
                        variant="outlined"
                        sx={{
                            maxWidth: 60,
                            minWidth: 60,
                            "& .MuiSelect-select": {
                                px: 1,
                                py: .5
                            }
                        }}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={6}>6</MenuItem>
                    </Select>
                </MDBox>
            }
        </MDBox>
    );
})

const DataFieldDropbox = memo(({ type, title, accept, singleItem, fields, onDrop, onDelete, onMove, onHover, onFieldSettingChange, onFieldSort }) => {
    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept,
        drop: (item) => onDrop(type, singleItem, item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    });

    let borderVal = '2px dashed #ddd'
    const isActive = isOver && canDrop
    if (isActive) {
        borderVal = '3px solid #4CAF50'
    } else if (canDrop) {
        borderVal = '3px solid #67bb6a'
    }

    return (
        <MDBox>
            {type === "sort" && (
                <MDBox mt={4} mb={.5}>
                    <MDTypography data-testid = {title?.toLowerCase().replaceAll(' ', '')} px={2} variant="button" fontWeight="medium">{title }</MDTypography>
                </MDBox>
            )}
            {type !== "sort" && (
                <MDTypography data-testid = {title?.toLowerCase().replaceAll(' ', '')} px={2} variant="caption" color="text" fontWeight="medium">{title}</MDTypography>
            )}
            <MDBox ref={dropRef}
                mx={1.5}
                px={.5}
                border={borderVal}
                borderRadius="6px"
                minHeight={50}
                display="flex" alignItems="center" justifyContent="center" flexDirection="column"
            >
                {fields?.map(
                    (f, i) => <DataFieldChip
                        key={f.name}
                        index={i}
                        dropType={type}
                        accept={accept}
                        field={f}
                        onDelete={onDelete}
                        onMove={onMove}
                        onFieldSettingChange={onFieldSettingChange}
                        onFieldSort={onFieldSort}
                        onHover={onHover}
                    />
                )}
                <MDTypography data-testid = {"Drop field here only".toLowerCase().replaceAll(' ', '')}py={.75} variant="caption" color="text">Drop field here only</MDTypography>
            </MDBox>
        </MDBox>
    );
});

export default DataFieldDropbox;
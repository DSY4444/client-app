const colPaddings = {
    "small": { px: 1, py: 0.75 },
    "medium": { px: 1.5, py: 1 },
    "large": { px: 2, py: 1.5 },
};

export const tableStyles = (
    {
        palette: { black, info, error },
        functions: { rgba },
        borders: { borderWidth }
    },
    {
        fluidLayout, paddingSize, horizBorders, vertBorders, altRowBorders, editable
    }
) => {

    const borderStyles = (element) => {
        if (element === "header")
            return {
                borderBottom: `${borderWidth[1]} solid ${rgba(black.main, 0.05)}`,
                borderRight: vertBorders ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
            };

        else if (element === "body")
            return {
                borderBottom: horizBorders ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
                borderRight: vertBorders ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
            };

        return {
            borderTop: `${borderWidth[1]} solid ${rgba(black.main, 0.05)}`,
            borderBottom: horizBorders ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
            borderRight: vertBorders ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
        };
    };

    const paddingStyles = () => {
        return colPaddings[paddingSize || "small"];
    };

    return {
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1,
        overflow: "auto",
        "& .MuiTable-root": {
            ...(!fluidLayout && { height: "100%" }),
            ...(fluidLayout && { width: "inherit" })
        },
        "& .MuiTableHead-root": {
            position: "sticky",
            top: 0,
        },
        "& .MuiTableCell-head": {
            border: "none",
            position: "relative",
            backgroundColor: "#fafafa",
            lineHeight: "140%",
            "& .resizer": {
                display: 'inline-block',
                width: 5,
                height: '100%',
                position: 'absolute',
                right: 0,
                top: 0,
                transform: 'translateX(50%)',
                zIndex: 1,
                touchAction: 'none'
            },
            "& .resizer:hover": {
                background: info.main,
            },
            "&:first-of-type": {
                pl: 2,
                borderLeft: 'none',
            },
            "&:last-child": {
                pr: 2
            },
            ...borderStyles("header"),
            ...paddingStyles(),
            ...(editable ? { whiteSpace: "nowrap" } : {}),
        },
        "& .MuiTableCell-body": {
            border: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            "&:first-of-type": {
                pl: 2,
                borderLeft: 'none',
            },
            "&:last-child": {
                pr: 2
            },
            ...borderStyles("body"),
            ...paddingStyles(),
            ...(editable ? { whiteSpace: "nowrap" } : {}),
        },
        "& .MuiTableRow-root:nth-of-type(2n)": altRowBorders ? {
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
        } : {},
        "& .MuiTableRow-root:hover": {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
        },
        "& .MuiTableFooter-root": {
            position: "sticky",
            bottom: 0,
        },
        "& .MuiTableCell-footer": {
            minHeight: 34,
            overflow: "hidden",
            textOverflow: "ellipsis",
            borderLeft: "none",
            "&:first-of-type": {
                pl: 2,
                borderLeft: 'none',
            },
            "&:last-child": {
                pr: 2
            },
            ...borderStyles("footer"),
            ...paddingStyles(),
            ...(editable ? { whiteSpace: "nowrap" } : {}),
        },
        "& .grandTotal": {
            backgroundColor: "#fafafa",
        },
        "& .invalid": {
            border: `1px solid ${error.main}`,
        }
    }
};
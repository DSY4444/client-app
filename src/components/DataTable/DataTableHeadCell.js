// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "../MDBox";

// Material Dashboard 2 React contexts
import { useAppController } from "../../context";
import { TableCell } from "@mui/material";
import rgba from "../../assets/theme/functions/rgba";

function DataTableHeadCell({ width, variant, bordered, children, disableSorting, sorted, sortedBy, align, ...rest }) {
  const [controller] = useAppController();
  const { darkMode } = controller;

  return (
    <TableCell
      sx={({ palette: { black }, borders: { borderWidth } }) => ({
        border: "none",
        width: width,
        display: "table-cell",
        py: 2.3,
        pl: 1.5,
        pr: 2.5,
        backgroundColor: variant === "subtable" ? "#f0eded" : "#fff",
        borderTop: `${borderWidth[1]} solid ${rgba(black.main, 0.05)}`,
        borderBottom: `${borderWidth[1]} solid ${rgba(black.main, 0.05)}`,
        borderLeft: bordered ? `${borderWidth[1]} solid ${rgba(black.main, 0.05)}` : 'none',
        "&:first-of-type": {
          pl: 3,
          borderLeft: 'none',
        },
        "&:last-child": {
          pr: 3
        },
      })}
      {...rest}
    >
      <MDBox
        title="Click to sort"
        // position="relative"
        // textAlign={align}
        color={darkMode ? "white" : "dark"}
        opacity={0.9}
        sx={({ typography: { size, fontWeightMedium } }) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: align === "left" ? "flex-start" : "flex-end",
          fontSize: size.xs,
          fontWeight: fontWeightMedium,
          textTransform: "captilize",
          cursor: sorted && "pointer",
          userSelect: sorted && "none",
          whiteSpace: "nowrap",
          // paddingRight: "18px"
        })}
      >
        {children}
        {
          !disableSorting && (
            <MDBox
              position="relative"
              // top="6px"
              // right="16px"
              sx={({ typography: { size } }) => ({
                height: "12px",
                fontSize: size.lg,
              })}
            >
              <MDBox
                position="absolute"
                top={-6}
                color={sortedBy === "asce" ? "text" : "secondary"}
                opacity={sortedBy === "asce" ? 1 : 0.5}
              >
                <Icon>arrow_drop_up</Icon>
              </MDBox>
              <MDBox
                position="absolute"
                top={0}
                color={sortedBy === "desc" ? "text" : "secondary"}
                opacity={sortedBy === "desc" ? 1 : 0.5}
              >
                <Icon>arrow_drop_down</Icon>
              </MDBox>
            </MDBox>
          )
        }
      </MDBox>
    </TableCell>
  );
}

// Setting default values for the props of DataTableHeadCell
DataTableHeadCell.defaultProps = {
  width: "auto",
  variant: "page",
  sorted: false,
  bordered: false,
  disableSorting: false,
  sortedBy: "none",
  align: "left",
};

// Typechecking props for the DataTableHeadCell
DataTableHeadCell.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf(["page", "tile", "subtable"]),
  children: PropTypes.node.isRequired,
  sorted: PropTypes.bool,
  bordered: PropTypes.bool,
  disableSorting: PropTypes.bool,
  sortedBy: PropTypes.oneOf(["none", "asce", "desc"]),
  align: PropTypes.oneOf(["left", "right", "center"]),
};

export default DataTableHeadCell;

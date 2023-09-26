// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../MDBox";
import rgba from "../../assets/theme/functions/rgba";

function DataTableBodyCell({ noBorder, bordered, align, children, ...rest }) {
  return (
    <MDBox
      component="td"
      textAlign={align}
      py={2.3}
      px={1.5}
      sx={({ palette: { light, black }, typography: { size }, borders: { borderWidth } }) => ({
        display: "table-cell",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        fontSize: size.sm,
        borderBottom: noBorder && !bordered ? "none" : `${borderWidth[1]} solid ${light.main}`,
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
      {children}
    </MDBox>
  );
}

// Setting default values for the props of DataTableBodyCell
DataTableBodyCell.defaultProps = {
  noBorder: false,
  bordered: false,
  align: "left",
};

// Typechecking props for the DataTableBodyCell
DataTableBodyCell.propTypes = {
  children: PropTypes.node.isRequired,
  noBorder: PropTypes.bool,
  bordered: PropTypes.bool,
  align: PropTypes.oneOf(["left", "right", "center"]),
};

export default DataTableBodyCell;

import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Custom styles for the Configurator
import YADrawerRoot from "components/YADrawer/YADrawerRoot";

function YADrawer(props) {
  const { title, subtitle, open, variant, anchor, hideHeader, topPadded, width, onClose, children } = props;
  // const [openDrawer, setOpenDrawer] = useState(false);

  const handleCloseDrawer = () => {
    if (onClose) onClose();
  };

  return (
    <YADrawerRoot
      open={open}
      anchor={anchor}
      onClose={handleCloseDrawer}
      variant={variant}
      ownerState={{ openDrawer: open, topPadded, width, anchor }}
    >
      {
        !hideHeader && (
          <>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="baseline"
              pt={4}
              pb={0.5}
              pl={3}
              pr={2}
            >
              <MDBox>
                <MDTypography variant="h5">{title}</MDTypography>
                {
                  subtitle && (
                    <MDTypography variant="body2" color="text">
                      {subtitle}
                    </MDTypography>
                  )
                }
              </MDBox>
              <Icon
                sx={({ typography: { size }, palette: { dark } }) => ({
                  fontSize: `${size.lg} !important`,
                  color: dark.main,
                  stroke: "currentColor",
                  strokeWidth: "2px",
                  cursor: "pointer",
                  transform: "translateY(-15px)",
                })}
                onClick={handleCloseDrawer}
              >
                close
              </Icon>
            </MDBox>

            <Divider />
          </>
        )
      }
      <MDBox height="100%">
        {children}
      </MDBox>
    </YADrawerRoot>
  );
}

YADrawer.defaultProps = {
  variant: "temporary",
  anchor: "right",
  hideHeader: false,
  topPadded: true,
  width: 360,
};

export default YADrawer;

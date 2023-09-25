import { Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const sizes = {
  "small": { iconSize: "32", titleVariant: "h6", descriptionVariant: "button" },
  "smallMed": { iconSize: "70", titleTm: 1, subtitleBm: 6, titleVariant: "h6", descriptionVariant: "button" },
  "medium": { iconSize: "80", titleTm: 2, titleBm: 2, subtitleBm: 3, titleVariant: "h5", descriptionVariant: "subtitle2" },
  "large": { iconSize: "100", titleTm: 4, titleBm: 2, subtitleBm: 3, titleVariant: "h5", descriptionVariant: "subtitle2" }
}

const EmptyState = ({ variant, size, image, iconName, iconComponent, hideIcon, title, description, actions }) => {
  const { iconSize, titleTm, titleBm, titleVariant, subtitleBm, descriptionVariant } = sizes[size];
  return <MDBox display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ maxWidth: 464, mx: "auto", mt: hideIcon ? 0 : 6, mb: 6 }}>
    {
      iconComponent && iconComponent
    }
    {!iconComponent &&
      <>
        {
          !hideIcon && !image && iconName && (
            <Icon color={variant} sx={{ fontSize: `${iconSize}px!important` }}>{iconName}</Icon>
          )
        }
        {
          !hideIcon && image && (
            <img src={image} alt="" style={{ height: 200 }} />
          )
        }
      </>
    }
    {
      title && (
        <MDTypography data-testid = {title?.toLowerCase().replaceAll(' ', '')} mt={titleTm} mb={titleBm} variant={titleVariant} color="text" component="span" display="flex" justifyContent="center" alignItems="center">{title}</MDTypography>
      )
    }
    {
      description && (
        <MDTypography data-testid = {description?.toLowerCase().replaceAll(' ', '')} component="p" mb={subtitleBm} variant={descriptionVariant} color="dark" textAlign="center">{description}</MDTypography>
      )
    }
    {
      actions && (typeof actions === "function") ? actions() : actions
    }
  </MDBox>
}

EmptyState.defaultProps = {
  variant: "primary",
  size: "small",
  hideIcon: false
}

export default EmptyState;
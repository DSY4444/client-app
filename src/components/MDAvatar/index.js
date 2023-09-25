import { forwardRef } from "react";
import PropTypes from "prop-types";
import MDAvatarRoot from "components/MDAvatar/MDAvatarRoot";

const stringAvatar = (name) => {
  const nameArr = name?.split(' ') || [];
  const nameShort = name ? (nameArr.length > 1 ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` : `${name.split(' ')[0][0]}`) : "";
  return {
    name,
    children: nameShort,
  };
}

const MDAvatar = forwardRef(({ bgColor, size, shadow, name, ...rest }, ref) => (
  <MDAvatarRoot ref={ref} ownerState={{ shadow, bgColor, size }} {...stringAvatar(name)} {...rest} />
));

// Setting default values for the props of MDAvatar
MDAvatar.defaultProps = {
  bgColor: "info",
  size: "md",
  shadow: "none",
};

// Typechecking props for the MDAvatar
MDAvatar.propTypes = {
  bgColor: PropTypes.oneOf([
    "transparent",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", "xxl"]),
  shadow: PropTypes.oneOf(["none", "xs", "sm", "md", "lg", "xl", "xxl", "inset"]),
};

export default MDAvatar;

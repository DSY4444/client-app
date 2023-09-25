import {
  ClickAwayListener,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import StyledPopper from 'components/StyledPopper';
import { useState } from 'react';

const menuButtonStyles = (theme, { selected }) => ({
  p: 0,
  height: 24,
  width: 28,
  border: selected ? `1px solid #ddd` : `1px solid transparent`,
  borderRadius: 1,
  backgroundColor: selected ? 'rgba(0, 0, 0, 0.04)' : "inherit",
  '&:hover': {
    border: `1px solid #ddd`,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const menuStyles = ({ palette: { text }, typography: { size } }) => ({
  p: 1,
  '& .MuiListItem-root': {
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    cursor: 'pointer'
  },
  '& .MuiListItem-root:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiListItemText-primary': {
    color: text.main,
    fontSize: size.sm,
    lineHeight: size.md,
  },
});

const RowMenu = (props) => {
  const { iconName, iconColor, options, onClose } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // event.stopPropagation();
  };

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
    if (onClose)
      onClose();
  };
  const open = Boolean(anchorEl);
  return (
    <>
      <IconButton color={iconColor} onClick={options && handleClick} sx={(theme) => menuButtonStyles(theme, { selected: Boolean(anchorEl) })}>
        <Icon>{iconName}</Icon>
      </IconButton>
      {options &&
        <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start"
          sx={{ width: "inherit" }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 4],
              },
            },
          ]}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <List sx={(theme) => menuStyles(theme)}>
              {
                options?.map((o) => (
                  <ListItem
                    key={o.label}
                    onClick={() => {
                      handleClose();
                      o.onClick();
                    }}
                  >
                    <ListItemText primary={o.label}></ListItemText>
                  </ListItem>
                ))
              }
            </List>
          </ClickAwayListener>
        </StyledPopper>
      }
    </>
  );
};

RowMenu.defaultProps = {
  iconName: "more_horiz",
  iconColor: "text"
};

export default RowMenu;

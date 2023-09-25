import { Controller } from 'react-hook-form';
import MDBox from "components/MDBox";
import { Icon, IconButton, Tooltip, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useAppController } from 'context';

export const DatepickerCore = (props) => {
  const {
    name,
    label,
    required,
    view,
    inputFormat,
    variant,
    width,
    disabled,
    value,
    isFocused,
    onDateChange,
    onDateBlur,
    errorMessage,
  } = props;
  const [dateValue, setDateValue] = useState(moment(value).isValid() ? moment(moment(value, "YYYY-MM-DD").format(inputFormat), inputFormat) : null);

  useEffect(() => {
    setDateValue(moment(value).isValid() ? moment(moment(value, "YYYY-MM-DD").format(inputFormat), inputFormat) : null);
  }, [value]);

  return (
    <DesktopDatePicker
      label={label}
      inputFormat={inputFormat}
      views={view ? [view] : []}
      value={dateValue}
      onChange={(value) => {
        setDateValue(value);
        onDateChange(moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : null);
      }}
      renderInput={(params) => (
        <TextField
          type="text"
          name={name}
          required={required}
          helperText={errorMessage}
          //   value={value || ''}
          variant={variant || 'standard'}
          sx={width ? { '& .MuiInputBase-root': { width: width } } : undefined}
          fullWidth={width ? false : true}
          disabled={disabled}
          {...params}
          autoFocus={isFocused}
          error={errorMessage ? true : false}
          onBlur={({ target: { value: dateVal } }) => {
            setDateValue(
              moment(dateVal, inputFormat, true).isValid() ? moment(dateVal, inputFormat) : null,
            );
            if (onDateBlur)
              onDateBlur()
          }}
        />
      )}
    />
  );
};

const DatePicker = (props) => {
  const {
    control,
    disabled,
    view,
    fieldDef: { name, displayName, format, required, variant, width, placeholder, toolTip },
    errorMessage,
  } = props;

  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";
  let newFormat = null
  if (view === 'year') 
    newFormat = 'YYYY'
  else
    newFormat = format

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
        <MDBox sx={ {"&:hover": { "& .helpIcon" : { visibility: 'visible' } }} } display='flex' flexDirection='row'>
        <DatepickerCore
          label={displayName}
          name={name}
          view={view}
          required={required}
          errorMessage={errorMessage}
          inputFormat={newFormat || defaultDateFormat}
          placeholder={placeholder}
          variant={variant}
          value={value}
          width={width}
          disabled={disabled}
          onDateChange={onChange}
        />
        {toolTip?.length >= 0 && 
          <IconButton className="helpIcon"
              sx={({ palette: { text } }) => ({
              // marginLeft: .15,
              // marginBottom: 1,
              paddingTop: 2,
              marginRight: -2,
              color: "#979191",
              visibility: 'hidden',
              "&:hover": {
                  color: text.main
              }
              })}
              size="small"
          //   onClick={() => {
          //     // showinapphelp ? showinapphelp === 'true' ? openContextHelp(dispatch, pageName) :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp') :  window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
          //     window.open(helpCenterUrl+'/'+pageName,'yarkenhelp');
          //   }}
          >
              <Tooltip placement="left" title={toolTip ? toolTip : displayName}>
                  <Icon>help</Icon>
              </Tooltip>
          </IconButton>
        }
        </MDBox>
        </>
      )}
    />
  );
};

export default DatePicker;

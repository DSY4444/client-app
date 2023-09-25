import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Icon, List, ListItem, TextField, Autocomplete, CircularProgress, Card, Alert } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import MDButton from "components/MDButton";
import { useYADialog } from "components/YADialog";
import YAScrollbar from "components/YAScrollbar";
import DataTable from 'components/DataTable';
import EmptyState from 'components/EmptyState';
import new_item_img from 'assets/svg/add_new.svg';
import moment from 'moment';
import numeral from 'numeral';
import { useAppController } from 'context';
import {  pickColorNum } from 'utils/table';
import Axios from "axios";
import { getDomain, ActiveStatusReverse } from 'utils';
import UploadPage from "pages/UploadPage";
import _ from 'lodash'
import TeamMemberPopup from "components/TeamMemberPopup";
import AddTeamMapping from "components/AddTeamMapping";
import PublishSpend from "components/PublishSpend";
import colors from "assets/theme/base/colors";
import MDAvatar from 'components/MDAvatar';

const buildColumns = (masterDef, defaultDateFormat) => {
  const avatarStyles = (color) => ({
    marginRight: 0.75,
    background: color ? color[0] : '#454545',
    fontWeight:'bold',
    color: color ? color[1] : '#ffffff',
  })
  const columns = [];
  if (Array.isArray(masterDef.fields) && masterDef.fields.length > 0) {
    masterDef.fields.forEach((f) => {
      let col = { align: f.align || 'left' };
      let accessor = f.schemaName;
      if (f.type === 'dropdown' && f.dataSource?.type === 'dynamic') {
        if (f.dataSource.alias && f.dataSource.alias !== "") {
          accessor = `${f.dataSource.alias}__${f.dataSource.labelField}`;
        } else {
          accessor = `${f.dataSource.object}__${f.dataSource.labelField}`;
        }
      }
      col['Header'] = f.displayName;
      col['accessor'] = accessor;
      col['Cell'] = ({ cell: { value } }) => {
        if (f.type === "currency")
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{numeral(value).format('$0,0')}</MDTypography>
        else if (f.type === "datepicker")
          if (f.view === "year")
            return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value ? moment(value).format("YYYY") : ""}</MDTypography>
          else
            return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value ? moment(value).format(f.format || defaultDateFormat) : ""}</MDTypography>
        if (f.type === "dropdown" && f.dataSource.type === "static") {
          let newValue = ""
          if (value)
            newValue = _.find(f.dataSource.data, { "value": value }) ? _.find(f.dataSource.data, { "value": value }).label : ""
          return <MDTypography key={accessor} variant="caption"  color="dark" fontWeight={f.emphasize && "medium"}>{newValue}</MDTypography>
        } else if(f.avatar && value) {
          let value1 = value.trim().replaceAll("  ", "")
          let colorval = pickColorNum(value1)
          let color = colors.avatarColors[colorval]
        return <MDTypography key={accessor} variant="caption" color="dark" display="flex" alignItems="center" fontWeight={f.emphasize && "medium"}><MDAvatar name={value.toUpperCase()} size="xs" sx={() =>  avatarStyles(color)} />{value}</MDTypography>
        }
        else
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value}</MDTypography>
      };
      col['dataType'] = f.filterType || f.type
      col['disableFilters'] = f.disableFilters || false,
        columns.push(col);
    });
  }
  if (!masterDef.readonly)
    columns.push({
      Header: '',
      accessor: 'actions',
      align: 'left',
      disableSorting: true,
      disableFilters: true,
    });
  return columns;
};

const buildRows = (pkColumn, data, onEdit, onDelete, onAdd, selectedCategoryDef) => {
 selectedCategoryDef && selectedCategoryDef.master && selectedCategoryDef.master === "user" ? data = ActiveStatusReverse(data) : data
  let addmember = (selectedCategoryDef, row) => {
    let formdetails = { "selectedCategoryDef": selectedCategoryDef, "row": row }
    if (selectedCategoryDef && selectedCategoryDef.additonallink) {

      return (
        <MDTypography
          display="flex"
          alignItems="center"
          ml={3}
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={() => onAdd(formdetails)}
        >
          <Icon fontSize="small" color="info">
            {
              selectedCategoryDef.additonallinkicon ? selectedCategoryDef.additonallinkicon : 'add'
            }
          </Icon>
          &nbsp; {selectedCategoryDef.additionallinktext ? selectedCategoryDef.additionallinktext : 'Add'}
        </MDTypography>
      )
    }
  }
  let editEnable = (r) => {
    if (onEdit) {
      return (
        <>
          {selectedCategoryDef.name == "cloudTeamMapping" ?
            <MDTypography
              display="flex"
              alignItems="center"
              component="a"
              href="#"
              onClick={() => onEdit(r[pkColumn])}
              variant="caption"
              color="text"
              fontWeight="medium"
            >
              <Icon fontSize="small" color="info">add</Icon>&nbsp;Add Exception
            </MDTypography>
            :
            <MDTypography
              display="flex"
              alignItems="center"
              component="a"
              href="#"
              onClick={() => onEdit(r[pkColumn])}
              variant="caption"
              color="text"
              fontWeight="medium"
            >
              <Icon fontSize="small">edit</Icon>&nbsp;Edit
            </MDTypography>

          }
        </>
      )
    }
  }
  const rows = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((r) => {
      let row = {};
      Object.keys(r).forEach((k) => {
        row[k.replace(/\./g, '__')] = r[k];
      });
      row['actions'] =
        r?.taxonomy === true ? (
          <span></span>
        ) : (
          <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
            {editEnable(r)}
            <MDTypography
              display="flex"
              alignItems="center"
              ml={3}
              component="a"
              href="#"
              onClick={() => onDelete(r[pkColumn])}
              variant="caption"
              color="text"
              fontWeight="medium"
            >
              <Icon fontSize="small" color="error">
                delete
              </Icon>
              &nbsp;Delete
            </MDTypography>
            {
              addmember(selectedCategoryDef, r)
            }
          </MDBox>
        );
      rows.push(row);
    });
  }
  return rows;
};

export const Masters = (props) => {
  const { masterId, selectedCategoryDef } = props;
  const [step, setStep] = useState('LOADING');
  const handleError = useHandleError();
  const [masterDef, setMasterDef] = useState(null);
  const [rows, setRows] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [refresh, setRefresh] = useState(null);
  const [showTeamMember, setshowTeamMember] = useState(false)
  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const { showForm, showAlert, showPrompt, showSnackbar } = useYADialog();

  const handleClose = () => {
    setRefresh(Math.random());
  };

  const handleAdd = (item) => {
    setRowData(item)
    setshowTeamMember(true)

  }
  const handleTeamMemberClose = () => {
    setshowTeamMember(false)
  }

  const handleEdit = (pkId) => {
    showForm(
       masterDef.name == "cloudTeamMapping" ? `Add ${masterDef.singularDisplayName || masterDef.displayName} Exception` : `Edit ${masterDef.singularDisplayName || masterDef.displayName}`,
      masterDef,
      handleClose,
      'edit',
      pkId,
    );
  };

  const deleteMaster = async (pkId) => {
    const [err, data] = await fetchRequest.delete(`/api/master/${masterId}/${pkId}`);
    if (err) {
      if (err.data.message === "AdminRoleChangeFail") {
        showAlert("Attention", "Assign another admin before deleting this user.")
      } else
        showAlert('Delete', 'Something went wrong. Contact your administrator.');
    }
    else
      if (data && data.result === true) {
        showSnackbar('Data deleted successfully', 'success');
        handleClose();
      }
      else if (data && data.result === false) {
        showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
      }
  };

  const handleDeleteSuccess = (pkId) => {
    deleteMaster(pkId);
  };

  const handleDelete = (pkId) => {
    showPrompt('Delete', 'Are you sure you want to delete?', () => handleDeleteSuccess(pkId));
  };
  
  const handleDeleteMultiple = (selectedRows) => {
    showPrompt("Delete", "Are you sure you want to delete?", () =>
      deleteCostPoolMappingMultipleRecords(JSON.stringify(selectedRows))
    );
  };

  const deleteCostPoolMappingMultipleRecords = async (selectedRows) => {
    const [err, data] = await fetchRequest.post(
      `/api/dataflow/teamRules/delete/selected`,
      selectedRows
    );

    if (err) {
      showAlert("Delete", "Something went wrong. Contact your administrator.");
    } else if (data) {
      showSnackbar(data, "success");
      if (setRefresh) {
        setRefresh(Math.random());
      }
    }
  };

  useEffect(() => {
    async function getMasterDef() {
      var [err, data] = await fetchRequest.get(`/api/master/${masterId}`);
      if (err) {
        handleError(err);
      } else {
        setMasterDef(data);
        setColumns(buildColumns(data, defaultDateFormat));
      }
    }
    getMasterDef();
  }, [masterId, selectedCategoryDef]);

  useEffect(() => {
    async function getList() {
      var [err, data] = await fetchRequest.get(`/api/master/${masterId}/list`);
      if (err) {
        handleError(err);
      } else {
        if (data && Array.isArray(data) && data.length > 0) {
          setRows(buildRows(masterDef.pkColumn || 'id', data, handleEdit, handleDelete, handleAdd, selectedCategoryDef));
          setStep('LOADED');
        } else {
          setStep('EMPTY');
        }
      }
    }
    if (masterDef) {
      getList();
    }
  }, [masterId, masterDef, refresh]);


  if (step === 'LOADING') {
    return <YASkeleton variant="loading" />;
  }

  const { displayName, singularDisplayName, desc, message } = masterDef;

  const handleAddButtonClick = () => {
    showForm(`New ${singularDisplayName || displayName}`, masterDef, handleClose);
  };

  const renderPrimaryActions = !masterDef.readonly ? (
    <MDButton
      variant="gradient"
      color="info"
      sx={{marginLeft:"10px"}}
      startIcon={<Icon>add</Icon>}
      onClick={handleAddButtonClick}
    >
      Add New
    </MDButton>
  ) : undefined;

  const renderAddButton = () =>
    !masterDef.readonly ? (
      <MDButton
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
      >
        Add New
      </MDButton>
    ) : undefined;

  return (
    <MDBox flex={1} display="flex" flexDirection="column" px={4} py={3}>
      {showTeamMember && <TeamMemberPopup handleTeamMemberClose={handleTeamMemberClose} data={rowData} buildColumns={buildColumns} buildRows={buildRows} defaultDateFormat />}
      <MDTypography variant="button" color="dark" fontWeight="medium">{displayName}</MDTypography>
      <MDTypography mb={1} variant="button" color="text">{desc}</MDTypography>
      {
        message &&
        <Alert severity="warning"
          sx={{ marginTop: 1, marginBottom: 1, fontSize: "14px", textAlign: "left" }}
        >{message}</Alert>
      }
      <MDBox pt={1}>
        {step === 'LOADED' && (
          <Card sx={{ height: '100%' }} px={0}>
            <DataTable
              table={{ columns, rows }}
              showTotalEntries={true}
              isSorted={true}
              isSelectable={selectedCategoryDef?.name == "cloudTeamMapping" ? true : false}
              newStyle1={true}
              noEndBorder
              entriesPerPage={true}
              canSearch={true}
              canFilter={true}
              hideFooterForMinRecords={true}
              primaryActions={renderPrimaryActions}
              deleteMultiple={true}
              onDeleteMultiple={handleDeleteMultiple}
            />
          </Card>
        )}
        {step === 'EMPTY' && (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <EmptyState
              size="large"
              image={new_item_img}
              title={`No ${displayName} Yet`}
              description={
                !masterDef.readonly
                  ? `Click on the '+ add new' button to add a new ${(
                    singularDisplayName || displayName
                  ).toLowerCase()}.`
                  : undefined
              }
              actions={renderAddButton}
            />
          </MDBox>
        )}
      </MDBox>
    </MDBox>
  );
};

const AppSettingDropdown = (props) => {
  const { name, displayName, required, helperText, type, dataSource, value, actions, refreshKey, onSave } = props;
  const [val, setVal] = useState(value);
  const [options, setOptions] = useState(dataSource?.type === 'static' ? dataSource.data : []);
  const [loading, setLoading] = useState(dataSource?.type !== 'static');
  const [error, setError] = useState(false);
  const [thresholdError, setThresholdError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSnackbar, showAlert } = useYADialog();

  useEffect(() => {
    async function getOptions() {
      setLoading(true);
      if (type !== "integer") {
        const [err, data] = await fetchRequest.get(`/api/settings/${name}`);
        if (err)
          console.error(err)
        setOptions(data || []);
        setLoading(false);
      }

    }
    if (dataSource?.type !== 'static') getOptions();
  }, [name, refreshKey]);

  useEffect(() => {
    if (val !== value)
      setVal(value);
  }, [value]);

  const handlePostClientActions = () => {
    if (actions?.length > 0) {
      actions.filter(a => a.location === "client")?.forEach(a => {
        if (a.type === "updateStorage") {
          if (sessionStorage && a.key !== 'Month')
            sessionStorage[a.key] = val;
        }
      })
    }
  }

  const handleSave = async (evt) => {
    evt.preventDefault();
    setError(false);
    const domain = getDomain();

    const err = required && (!val || val === "");

    if (!err) {
      setIsSubmitting(true);

      const [_err, data] = await fetchRequest.post(`/api/settings/${name}`, { [name]: val });
      if (_err) {
        showAlert("Error", "Something went wrong. Contact your administrator.");
      }
      else {
        if (data && data.result === false) {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            let errorsObj = {};
            data.errors.forEach((e) => errorsObj[e.field] = true);
            setError(errorsObj);
          }
        }
        else {
          const appRes = await Axios.get(`${domain}/api/app?${("nc=" + Math.random()).replace(".", "")}`);
          if (typeof (Storage) !== "undefined")
            appRes.data.defaults?.map((item) => {
              if ((!sessionStorage[item.name]) || (item.name === 'Month')) {
                return sessionStorage[item.name] = item.value
              }
            })
          showSnackbar(data.message, "success");
          handlePostClientActions();

          if (onSave) onSave();
        }
      }

      setIsSubmitting(false);

    } else {
      setError(true);
    }

  }

  const handleCancel = () => {
    setThresholdError("")
    setError(false);
    setVal(value);
  }

  const handletextInput = (e) => {
    setThresholdError("")
    setError(false);
    e.preventDefault
    setVal(e.target.value)
  }
  const handleRagThreshold = async (e) => {
    if (val === '') {
      setError(true)
      setThresholdError('This field cannot be empty.Please enter a value')
      return
    }

    if (isNaN(val) || Number(val) <= 0) {
      setError(true)
      setThresholdError('Please enter a positive number')
      return
    }
    if (Number(val) >= 100) {
      setError(true)
      setThresholdError('Please enter a number between 0 and 100')
      return
    }
    if (thresholdError === "") {
      handleSave(e)
    }
  }
  if (type === "integer") {
    return (
      <MDBox display="flex" alignItems="flex-start" marginBottom={2}>
        <MDBox>
          <MDTypography mt={2} mb={.75} variant="caption" color="text" fontWeight="medium">{displayName} <br />
            <TextField
              // label={displayName}
              value={val}
              sx={{ width: 400 }}
              size="small"
              helperText={thresholdError !== '' ? thresholdError : helperText}
              error={Boolean(error)}
              onChange={handletextInput}
            />
          </MDTypography>
        </MDBox>
        {
          value !== val &&
          <>
            <MDButton
              size='small'
              iconOnly
              variant="gradient"
              color="success"
              disabled={isSubmitting}
              sx={{ marginTop: 4.5, marginLeft: 2, height: 30, width: 30 }}
              onClick={handleRagThreshold}
            >
              {isSubmitting ? <CircularProgress color="white" size={15} /> : <Icon>done</Icon>}
            </MDButton>
            <MDButton
              size='small'
              iconOnly
              variant="gradient"
              color="error"
              disabled={isSubmitting}
              sx={{ marginTop: 4.5, marginLeft: 1, height: 30, width: 30 }}
              onClick={handleCancel}
            >
              <Icon>close</Icon>
            </MDButton>
          </>
        }

      </MDBox>
    )
  } else {
    return (
      <MDBox display="flex" alignItems="flex-start" marginBottom={2}>
        <MDBox>
          <MDTypography mt={2} mb={.75} variant="caption" color="text" fontWeight="medium">{displayName}</MDTypography>
          <Autocomplete
            // multiple
            // limitTags={1}
            loading={loading}
            // disableClearable={true}
            onChange={(event, item) => {
              const value = Array.isArray(item) ? item?.map(i => i.value) : item?.value;
              setVal(value);
            }}
            options={options}
            value={val}
            getOptionLabel={(option) => {
              if (typeof option === 'number')
                return options.find((op) => op.value === option)?.label || '';
              if (typeof option === 'string')
                return (
                  options.find((op) => String(op.value)?.toLowerCase() === option?.toLowerCase())?.label || ''
                );
              return option?.label || '';
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name={name}
                // label={displayName}
                sx={{ width: 400 }}
                size="small"
                helperText={helperText}
                error={error}
              />
            )}
          />
        </MDBox>
        {
          value !== val &&
          <>
            <MDButton
              size='small'
              iconOnly
              variant="gradient"
              color="success"
              disabled={isSubmitting}
              sx={{ marginTop: 4.5, marginLeft: 2, height: 30, width: 30 }}
              onClick={handleSave}
            >
              {isSubmitting ? <CircularProgress color="white" size={15} /> : <Icon>done</Icon>}
            </MDButton>
            <MDButton
              size='small'
              iconOnly
              variant="gradient"
              color="error"
              disabled={isSubmitting}
              sx={{ marginTop: 4.5, marginLeft: 1, height: 30, width: 30 }}
              onClick={handleCancel}
            >
              <Icon>close</Icon>
            </MDButton>
          </>
        }

      </MDBox>
    );

  }

};

const AppSettingsByCategory = (props) => {
  const { settingsDef } = props;
  const handleError = useHandleError();
  const [refresh, setRefresh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState([]);

  useEffect(() => {
    async function getSettingsValues() {
      var [err, data] = await fetchRequest.get(`/api/settings/category/${settingsDef?.name}`);
      if (err) {
        handleError(err);
      }
      else {
        setFormValues(data);
      }
      setLoading(false);
    }
    getSettingsValues();
  }, [settingsDef, refresh])

  const handleOnSave = () => {
    setRefresh(Math.random());
  };

  if (loading) {
    return <YASkeleton variant="loading" />;
  }

  return <MDBox flex={1} display="flex" flexDirection="column" px={4} py={3}>
    <MDTypography variant="button" color="dark" fontWeight="medium">{settingsDef?.displayName}</MDTypography>
    <MDTypography mb={1} variant="button" color="text">{settingsDef?.desc}</MDTypography>
    {
      settingsDef?.settings?.map(
        s => {
          const formValue = formValues?.find(v => v.name === s.name)?.value;
          return <AppSettingDropdown
            key={s.name}
            name={s.name}
            required={s.required}
            displayName={s.displayName}
            value={formValue}
            dataSource={s.dataSource}
            helperText={s.helperText}
            type={s.type}
            actions={s.actions}
            refreshKey={refresh}
            onSave={handleOnSave}
          />
        }
      )
    }
  </MDBox>
}

const AppSettings = () => {

  const handleError = useHandleError();
  const { hash } = useLocation();
  const [appSettingsDef, setAppSettingsDef] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryDef, setSelectedCategoryDef] = useState(null);
  let appSettingTab = "cloudSpend"

  useEffect(() => {
    async function getSettings() {
      var [err, data] = await fetchRequest.get(`/api/settings`);
      if (err) {
        handleError(err);
      }
      else {
        setAppSettingsDef(data);
        if (data) {
          const anchor = hash !== '' ? hash.replace('#', '') : null
          if (anchor) {
            setSelectedCategoryDef(data?.categories[0]?.categories.find(cat => cat.name === anchor))
          } else {
            setSelectedCategoryDef(data?.categories[0]?.categories[0]);
          }
        }
      }
      setLoading(false);
    }
    getSettings();
  }, [])

  if (loading) {
    return <YASkeleton variant="dashboard-loading" />;
  }

  const renderMainCategories = () => {
    return appSettingsDef?.categories?.map(
      c => <MDBox key={c.name}>
        <MDTypography ml={1.25} variant="button" color="text" fontWeight="medium">{c.displayName}</MDTypography>
        <List sx={{ mt: .5, mb: 2 }}>
          {
            c?.categories?.map(cc => (
              <ListItem key={cc.name}>
                <MDButton
                  name={cc.name}
                  variant="text"
                  color="info"
                  sx={{
                    textTransform: "none",
                    py: .8,
                    px: 1.5,
                    mb: .25,
                    background: selectedCategoryDef?.name === cc.name ? 'rgba(28, 32, 77, 0.04)' : "inherit"
                  }}
                  onClick={() => setSelectedCategoryDef(cc)}
                >
                  {cc.displayName}
                </MDButton>
              </ListItem>
            ))
          }
        </List>
      </MDBox>
    )
  }
  return (
    <>
      <PageHeader title={appSettingsDef?.displayName} subtitle={appSettingsDef?.desc} />
      <MDBox width="100%" height="calc(100vh - 156px)" px={3} pt={1}>
        {/* {console.log(selectedCategoryDef)} */}
        <MDBox borderRadius="6px" border="1px solid #ddd" width="100%" height="100%" display="flex" overflow="hidden">
          <MDBox minWidth="280px" borderRight="1px solid #ddd" px={3} py={2}>
            <YAScrollbar>
              {renderMainCategories()}
            </YAScrollbar>
          </MDBox>
          <YAScrollbar>
            {selectedCategoryDef.type === "load" &&
              <UploadPage destination={selectedCategoryDef.destination} appSettingTab={appSettingTab} />
            }
            {selectedCategoryDef.type === "rules" &&
              <AddTeamMapping masterId={selectedCategoryDef.master} selectedCategoryDef={selectedCategoryDef} />
            }
            {selectedCategoryDef.type === "settings" &&
              <AppSettingsByCategory settingsDef={selectedCategoryDef} />
            }
            {selectedCategoryDef.type === "master" &&
              <Masters masterId={selectedCategoryDef.master} selectedCategoryDef={selectedCategoryDef} />
            }
            {selectedCategoryDef.type === "publish" &&
              <PublishSpend />
            }
          </YAScrollbar>
        </MDBox>
      </MDBox>
    </>
  );
};



export default AnimatedRoute(AppSettings);
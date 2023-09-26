
import MDBox from '../../components/MDBox';
import DataTable from '../../components/DataTable';
import MDTypography from '../../components/MDTypography';
import { Icon, Card, Modal, IconButton, CircularProgress, Menu, MenuItem } from '@mui/material';
// import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import colors from '../../assets/theme/base/colors';
import fetchRequest from '../../utils/fetchRequest';
import MDButton from '../../components/MDButton';
import { useYADialog } from '../../components/YADialog';
import PageHeader from '../../components/pageHeader';
import AnimatedRoute from '../../components/AnimatedRoute';
import YASkeleton from '../../components/YASkeleton';
import EmptyState from '../../components/EmptyState';
import new_item_img from '../../assets/svg/add_new.svg';
import useHandleError from '../../hooks/useHandleError';
import moment from 'moment';
import numeral from 'numeral';
import { useAppController } from '../../context';
import { useImmer } from 'use-immer';
import FilterChip from '../../components/FilterChip';
import * as XLSX from 'xlsx';



const FilterDropdown = (props) => {
  const { formId, filter, onFilterChange } = props;
  const { name, displayName, dataSource, values } = filter;
  const [options, setOptions] = useState(dataSource?.type === 'static' ? dataSource.data : []);
  const [loading, setLoading] = useState(dataSource?.type !== 'static');

  useEffect(() => {
    async function getOptions() {
      setLoading(true);
      const [error, data] = await fetchRequest.get(`/api/master/${formId}/${name}`);
      if (error)
        console.error(error)
      setOptions(data || []);
      setLoading(false);
    }
    if (dataSource?.type !== 'static') getOptions();
  }, [name]);

  const handleOnFilterChange = (selectedFilter) => {
    onFilterChange({
      name: selectedFilter.name,
      type: selectedFilter.type,
      operator: selectedFilter.operator,
      values: selectedFilter.values.map(v => options.find(o => o.label === v)?.value)
    });
  }

  const sOptions = useMemo(() => options?.map(o => o.label), [options]);
  const filterValue = { name, operator: "eq", values: values?.map(v => options?.find(o => o.value === v)?.label) };
  return (
    <FilterChip loading={loading} dismissible={false} openOnMount={false} key={name} dataType={"select"} name={name} field={displayName} filterValue={filterValue} options={sOptions} onFilterSave={handleOnFilterChange} />
  );
};

const buildColumns = (masterDef, defaultDateFormat) => {
  const columns = [];
  if (Array.isArray(masterDef.fields) && masterDef.fields.length > 0) {
    masterDef.fields?.filter(f => !f.hidden)?.forEach((f) => {
      let col = { align: f.align || (['integer', 'float', 'currency'].includes(f.type) ? 'right' : 'left') };
      let accessor = f.schemaName;
      if (f.type === 'dropdown') {
        accessor = `${f.dataSource.object}__${f.dataSource.labelField}`;
      }
      col['Header'] = f.displayName;
      col['accessor'] = accessor;
      col['Cell'] = ({ cell: { value } }) => {
        if (f.type === "currency")
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{numeral(value).format('$0,0')}</MDTypography>
        else if (f.type === "datepicker")
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value ? moment(value).format(f.format || defaultDateFormat) : ""}</MDTypography>

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
const buildPopupColumns = (masterName) => {
  let columns = [
    { Header: masterName, accessor: "masterRecordId", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="medium" color="dark">{value}</MDTypography> } },
    { Header: "Message", accessor: "message", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="small" color={value.includes("success") ? "success" : "error"}>{value}</MDTypography> } }
  ]
  return columns;
}

const buildRows = (pkColumn, data, onEdit, onDelete) => {
  const rows = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((r) => {
      let row = {};
      Object.keys(r).forEach((k) => {
        row[k.replace(/\./g, '__')] = r[k];
      });
      row['actions'] =
        Boolean(r?.taxonomy) === true ? (
          <span></span>
        ) : (
          <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
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
          </MDBox>
        );
      rows.push(row);
    });
  }
  return rows;
};

const filtersInitiaized = (filters) => {
  let initiaized = false;
  filters?.forEach(f => {
    if (f.values && Array.isArray(f.values) && f.values?.length > 0) {
      initiaized = true;
      return;
    }
  });
  return initiaized;
}
const buildPopupRows = (masterName, data) => {
  let rows = data.map(item => {
    return {
      "masterRecordId": item[masterName],
      "message": item["message"],
    }
  })
  return rows
}

const Masters = (props) => {
  const [step, setStep] = useState('LOADING');
  const handleError = useHandleError();
  // const { masterId } = useParams();
  const { masterId } = props
  const [masterDef, setMasterDef] = useImmer(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [refresh, setRefresh] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [popupRows, setpopupRows] = useState([])
  const [popupColumns, setpopupColums] = useState([])
  const [popup, setpopup] = useState(false)
  const [progress, setProgress] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const { showForm, showAlert, showPrompt, showSnackbar } = useYADialog();

  const handlePopup = () => {
    setpopup(false)
    setRefresh(Math.random());
  }

  const handleClose = () => {
    setRefresh(Math.random());
  };

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
    // showCustomDrawer('', () => <UserInfoDrawer />);
  };

  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };

  const handleDownload =  () => {
  if (columns && rows) {
  var data = [];
  rows.forEach(element => {  
    let obj = {}
    columns.forEach((e) => {
       if(e.type === 'date' && element[e.accessor] !== null){
       element[e.accessor] = moment(element[e.accessor]).format(defaultDateFormat);
     }
       obj[e.Header] = element[e.accessor]
     })
    data.push(obj)
  });
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'test')
  XLSX.writeFile(wb, `${masterId} ${moment(Date()).format("YYYYMMDDHHmmss")}.csv`)
}

    handleCloseMenuItem();
  }

  const handleEdit = (pkId) => {
    showForm(
      `Edit ${masterDef.singularDisplayName || masterDef.displayName}`,
      masterDef,
      handleClose,
      'edit',
      pkId,
    );
  };

  const handleOnUpdate = useCallback(({ selected }) => {
    setSelectedRows(selected)
  }, [])

  const deleteMaster = async (pkId) => {
    const [err, data] = await fetchRequest.delete(`/api/master/${masterId}/${pkId}`);
    if (err) {
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
  const deleteMasterMultipleRecords = async (selectedRows) => {
    setProgress(true);
    const [err, data] = await fetchRequest.post(`/api/master/${masterId}`, selectedRows);

    if (err) {
      setProgress(false)
      showAlert('Delete', 'Something went wrong. Contact your administrator.');
    }
    else
      if (data) {
        setProgress(false)
        setpopupColums(buildPopupColumns(masterDef.displayName));
        setpopupRows(buildPopupRows(masterDef.displayName, data));
        setpopup(true)
      }
  }

  const handleDeleteMultiple = (selectedRows) => {
    showPrompt('Delete', 'Are you sure you want to delete?', () => deleteMasterMultipleRecords(JSON.stringify(selectedRows)));
  };

  const getAppliedFilters = () => {
    if (!masterDef.filters || masterDef.filters.length === 0)
      return null;

    return {
      "filters": JSON.stringify(
        masterDef.filters?.map(f => ({
          name: f.name,
          operator: f.operator,
          value: f.values
        })) || []
      )
    };
  };

  useEffect(() => {
    async function getMasterDef() {
      var [err, data] = await fetchRequest.get(`/api/master/${masterId}`);
      if (err) {
        handleError(err);
      } else {
        setMasterDef(data);
        // if (data.filters && filtersInitiaized(data.filters))
        //   setFilters(data.filters)
        setColumns(buildColumns(data, defaultDateFormat));
      }
    }
    getMasterDef();
  }, [masterId]);

  useEffect(() => {
    async function getList() {
      setLoading(true);
      const appliedFilters = getAppliedFilters();
      var [err, data] = await fetchRequest.post(`/api/master/${masterId}/list`, appliedFilters);
      if (err) {
        handleError(err);
      } else {
        if (data && Array.isArray(data) && data.length > 0) {
          setRows(buildRows(masterDef.pkColumn || 'id', data, handleEdit, handleDelete));
          setStep('LOADED');
        } else {
          setRows([]);
          setStep('EMPTY');
        }
      }
      setLoading(false);
    }
    if (masterDef) {
      getList();
    }
  }, [masterId, masterDef, refresh]);

  if (step === 'LOADING') {
    return <YASkeleton variant="dashboard-loading" />;
  }

  const { displayName, singularDisplayName, desc, message, canFilter } = masterDef;

  const handleAddButtonClick = () => {
    showForm(`New ${singularDisplayName || displayName}`, masterDef, handleClose);
    handleCloseMenuItem();
  };

  const handleOnFilterChange = (selectedFilter) => {
    setMasterDef((draft) => {
      let filter = draft.filters?.find(f => f.name === selectedFilter.name);
      filter.operator = selectedFilter.operator;
      filter.values = selectedFilter.values;
    });
  };

  // const renderPrimaryActions = () => {
  //   return !masterDef.readonly ? (
  //     <>
  //        <MDBox color="text" pt={0} mt={0} display="flex" flexDirection="row">
  //         <Menu
  //           anchorEl={openMenu}
  //           anchorReference={null}
  //           anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  //           transformOrigin={{ vertical: "top", horizontal: "right" }}
  //           open={Boolean(openMenu)}
  //           onClose={handleCloseMenu}
  //         >
  //           {<>
  //             <MenuItem key={'download'} onClick={handleDownload}>{"Download"}</MenuItem>
  //           </>
  //           }
  //         </Menu>
  //         <MDBox mt={0.5} mr={-1} pt={0}>
  //           <MDButton
  //             // size="medium"
  //             disableRipple
  //             color="dark"
  //             variant="text"
  //             onClick={handleOpenMenu}
  //             sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
  //             iconOnly
  //           >
  //             <Icon px={0} py={0}>more_horiz</Icon>
  //           </MDButton>
  //         </MDBox>
  //         &nbsp;
  //         &nbsp; 
  //           <MDButton
  //       variant="gradient"
  //       color="info"
  //       startIcon={<Icon>add</Icon>}
  //       onClick={handleAddButtonClick}
  //     >
  //       Add New 
  //     </MDButton>  
  //       </MDBox> 
  //     </>
  //   ) : undefined;
  // };

  const renderPrimaryActions = () => {
    return (
      <>
    <Menu
          anchorEl={openMenu}
          anchorReference={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(openMenu)}
          onClose={handleCloseMenu}
        >
          {<>
            <MenuItem  data-testid = {"Download".toLowerCase().replaceAll(' ', '')} key={'download'} onClick={handleDownload}>{"Download"}</MenuItem>
          </>
          }
        </Menu>
        <MDBox >
        {!masterDef.type && (<MDButton
        data-testid = {"Add New".toLowerCase().replaceAll(' ', '')}
        variant="gradient"
        color="info"
        startIcon={<Icon>add</Icon>}
        onClick={handleAddButtonClick}
      >
        Add New
      </MDButton>)}
      &nbsp;
            <MDButton
            // size="medium"
            disableRipple
            color="dark"
            variant="text"
            onClick={handleOpenMenu}
            sx={{ "& .MuiIcon-root": { fontSize: "20px!important" } }}
            iconOnly
          >
            <Icon px={0} py={0}>more_horiz</Icon>
          </MDButton>
        </MDBox> 
    </>
    )
  }

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

  const renderFilters = () => {
    return (
      <>
        {masterDef.filters?.map((f) => (
          <FilterDropdown key={f.name} formId={masterId} filter={f} onFilterChange={handleOnFilterChange} />
        ))}
      </>
    )
  }
const defaultFilteresInitiaized = filtersInitiaized(masterDef?.filters);
return (
    <>
      <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
        <PageHeader title={displayName} subtitle={desc} message={message} primaryActionComponent={renderPrimaryActions}/>
        <MDBox p={3}>
        {step === 'EMPTY' && (masterDef.filters?.length === 0 || !defaultFilteresInitiaized) && (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="calc(100vh - 300px)"
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
        {(step === 'LOADED' || (step === 'EMPTY' && masterDef.filters?.length > 0) && defaultFilteresInitiaized) &&
          <>
            <Card sx={{ height: '100%' }} px={0}>
              <DataTable
                table={{ columns, rows }}
                showTotalEntries={true}
                isSorted={true}
                newStyle1={true}
                isSelectable={ masterDef.readonly || masterDef.taxonomy ? false : true }
                noEndBorder
                entriesPerPage={true}
                canSearch={true}
                onUpdate={handleOnUpdate}
                filtersComponent={renderFilters()}
                canFilter={canFilter}
                loading={loading}
                deleteMultiple={ masterDef.readonly || masterDef.taxonomy ? false : true }
                onDeleteMultiple={() => handleDeleteMultiple(selectedRows)}
                onDeleteAll={handleDeleteMultiple}
              />

              {progress && (
                <CircularProgress size={70} sx={() => ({ color: "#1A73E8", backgroundColor: "transparent", position: 'absolute', top: 350, left: 900, zIndex: 1, })} />
              )}

              <Modal open={popup} onClose={handlePopup}>
                <MDBox pt={20} pl={50} pr={50} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                  <Card sx={{ height: "75%", width: "95%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDBox>
                        <MDTypography variant="h6" component="span" color="text">
                          {masterDef.displayName} Deletion
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex">
                        <IconButton onClick={handlePopup} title="Close">
                          <Icon>close</Icon>
                        </IconButton>
                      </MDBox>
                    </MDBox>
                    <DataTable
                      table={{ columns: popupColumns, rows: popupRows }}
                      containerMaxHeight={474}
                      showTotalEntries={true}
                      entriesPerPage={true}
                    >
                    </DataTable>
                  </Card>
                </MDBox>
              </Modal>
            </Card>
          </>
        }
        </MDBox>
      </MDBox>
    </>
  );
};

export default AnimatedRoute(Masters);

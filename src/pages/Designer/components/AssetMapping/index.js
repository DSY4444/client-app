import MDBox from 'components/MDBox';
import DataTable from 'components/DataTable';
import MDTypography from 'components/MDTypography';
import { Icon, Card, Modal, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import fetchRequest from 'utils/fetchRequest';
import MDButton from 'components/MDButton';
import { useYADialog } from 'components/YADialog';
import PageHeader from 'components/PageHeader';
import AnimatedRoute from 'components/AnimatedRoute';
import YASkeleton from 'components/YASkeleton';
import EmptyState from 'components/EmptyState';
import new_item_img from 'assets/svg/add_new.svg';
import useHandleError from 'hooks/useHandleError';
import moment from 'moment';
import numeral from 'numeral';
import { useAppController } from 'context';
import { useImmer } from 'use-immer';
import FilterChip from 'components/FilterChip';
import * as XLSX from 'xlsx';
// import{backgroundProcessCheck} from '../../../../utils'

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
let linkFieldAccessor
let linkFieldColumns = []
const buildColumns = (masterDef, defaultDateFormat) => {
  linkFieldAccessor = []
  const columns = [];
  if (Array.isArray(masterDef.fields) && masterDef.fields.length > 0) {
    masterDef.fields?.filter(f => !f.hidden)?.forEach((f) => {
      let col = { align: f.align || (['integer', 'float', 'currency'].includes(f.type) ? 'right' : 'left') };
      let accessor = f.schemaName;
      if (f.type === 'dropdown' && !f.dataSource.consumptionAsset) {
        accessor = `${f.dataSource.object}__${f.dataSource.labelField}`;
      }
      if (f.type === "rule") {
        accessor = "ruleStr"
      }
      col['Header'] = f.displayName;
      col['accessor'] = accessor;
      col['Cell'] = ({ cell: { value } }) => {
        if (f.type === "currency")
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{numeral(value).format('$0,0')}</MDTypography>
        else if (f.type === "datepicker")
          return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value ? moment(value).format(f.format || defaultDateFormat) : ""}</MDTypography>
        else if (f.type === 'rule')
          return (value || "") !== "" ? <Tooltip placement="top" title={value}><Icon fontSize="medium" color="text">info</Icon></Tooltip> : null
        return <MDTypography key={accessor} variant="caption" color="dark" fontWeight={f.emphasize && "medium"}>{value}</MDTypography>
      };
      col['dataType'] = f.filterType || f.type
      col['disableFilters'] = f.disableFilters || false
      f.dataSource && f.dataSource.linkField != undefined ? linkFieldColumns.push(col) : columns.push(col);
      if (f.dataSource) {
        let columcreat = (f) => {
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
          col['disableFilters'] = f.disableFilters || false
          linkFieldColumns.push(col);
          linkFieldAccessor.push(accessor)
          if (f.dataSource) {
            linkFieldCheck(f)
          }
        }
        let linkFieldCheck = (f) => {
          if (f.dataSource.linkField) {
            columcreat(f.dataSource.linkField)
          }
        }
        f.dataSource.linkField ? linkFieldAccessor.push(accessor) : linkFieldAccessor
        linkFieldCheck(f)
        if (linkFieldColumns.length > 0) {
          linkFieldColumns = linkFieldColumns.reverse()
          linkFieldColumns.forEach(item => { columns.push(item) })
          linkFieldColumns = []
        }
      }
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

const buildRows = (pkColumn, data, onEdit, onDelete) => {
  const rows = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((r) => {
      let row = {};
      Object.keys(r).forEach((k) => {
        row[k.replace(/\./g, '__')] = r[k];
      });
      if (linkFieldAccessor.length > 0) {
        let nameSet = row[linkFieldAccessor[0]].split(" | ").reverse()
        for (let i = 0; i < linkFieldAccessor.length; i++) {
          row[linkFieldAccessor[i]] = nameSet[i]
        }
      }
      
      row['actions'] =
        r?.taxonomy === true ? (
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

const buildPopupColumns = (masterName) => {
  let columns = [
    { Header: masterName, accessor: "masterRecordId", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="medium" color="dark">{value}</MDTypography> } },
    { Header: "Message", accessor: "message", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" alignItems="center" fontWeight="small" color={value.includes("success") ? "success" : "error"}>{value}</MDTypography> } }
  ]
  return columns;
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


const AssetMapping = (props) => {
  const [step, setStep] = useState('LOADING');
  const handleError = useHandleError();
  const { masterId, uploadName, refresh, setRefresh, tabStyles } = props
  const [masterDef, setMasterDef] = useImmer(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [typeFilter, setTypeFilter] = useState(uploadName);
  const [popupRows, setpopupRows] = useState([])
  const [popupColumns, setpopupColums] = useState([])
  const [popup, setpopup] = useState(false)
  const [openMenu, setOpenMenu] = useState(false);

  const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const { showForm, showAlert, showPrompt, showSnackbar } = useYADialog();
  let filters = []
  const [filtersState, setFiltersState] = useImmer({ globalFilter: undefined, filters: filters });

  const handleOnFiltersStateUpdate = (latestGlobalFilter, latestFilters) => {
      setFiltersState(draft => {
        draft.globalFilter = latestGlobalFilter;
        draft.filters = latestFilters;
      });
    }

  const handlePopup = () => {
    setpopup(false)
    setRefresh(Math.random());
  }
  const handleClose = () => {
    setRefresh(Math.random());
  };

  const handleEdit = (pkId) => {
    showForm(
      `Edit ${masterDef.singularDisplayName || masterDef.displayName}`,
      masterDef,
      handleClose,
      'edit',
      pkId,
      "Changing Rules can lead to inconsistencies with the System of Record"
    );
  };


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
    const [err, data] = await fetchRequest.post(`/api/master/${masterId}`, selectedRows);

    if (err) {
      showAlert('Delete', 'Something went wrong. Contact your administrator.');
    }
    else
      if (data) {
        setpopupColums(buildPopupColumns(masterDef.displayName));
        setpopupRows(buildPopupRows(masterDef.displayName, data));
        setpopup(true)
      }
  }
  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget)
    // showCustomDrawer('', () => <UserInfoDrawer />);
  };

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
      let [err, data] = await fetchRequest.get(`/api/master/${masterId}`);
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
      let [err, data] = await fetchRequest.post(`/api/master/${masterId}/list`, appliedFilters);
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

//   const handleUploadButtonClick = async () => {
//     let bgData = await backgroundProcessCheck();
//     if(bgData.length>0)
//     {
//       showAlert(bgData[0],bgData[1],bgData[2],bgData[3]);
//     }else
//     {
//       showUploadDialog("Data Upload for " + uploadName, { uploadType: uploadType }, handleUploadDialogClose);
//       handleCloseMenuItem();
//     }
//   }

  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseMenuItem = (a) => {
    setOpenMenu(false)
    if (a)
      a();
  };

//   const handleUploadDialogClose = (uploadSuccess) => {
//     if (uploadSuccess) {
//       setRefresh(Math.random());
//     }
//   };

  const handleOnFilterChange = (selectedFilter) => {
    setMasterDef((draft) => {
      let filter = draft.filters?.find(f => f.name === selectedFilter.name);
      filter.operator = selectedFilter.operator;
      filter.values = selectedFilter.values;
    });
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
  };

  const renderPrimaryActions = () => {
    return   (
      <>
       <MDBox color="text" pt={0} mt={0} display="flex" flexDirection="row">
          <Menu
            anchorEl={openMenu}
            anchorReference={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(openMenu)}
            onClose={handleCloseMenu}
          >
            {<>
            <MenuItem key={'download'} onClick={handleDownload}>{"Download"}</MenuItem> 
            </>
            }
          </Menu>
       <MDButton data-testid = {"Add New".toLowerCase().replaceAll(' ', '')} variant="outlined" color="info" startIcon={<Icon>add</Icon>} onClick={handleAddButtonClick}>
        Add New
      </MDButton>
      &nbsp;
          <MDBox mt={0} mr={1} pt={0}>
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
      
        </MDBox>
      
      </>
    );
  };
  const renderPrimaryActions1 = () => {
    return   (
      <>
        <MDButton
          data-testid = {"Add New".toLowerCase().replaceAll(' ', '')}
          variant="outlined"
          color="info"
          startIcon={<Icon>add</Icon>}
          onClick={handleAddButtonClick}
        >
          Add New
        </MDButton>
      </>
    ) ;
  };

//   const renderAddButton = () =>
//      (
//       <MDButton
//         data-testid = {"Upload".toLowerCase().replaceAll(' ', '')}
//         variant="gradient"
//         color="info"
//         startIcon={<Icon>cloud_upload</Icon>}
//         onClick={handleUploadButtonClick}>
//         Upload
//       </MDButton>
//       // <MDButton
//       //   variant="outlined"
//       //   color="info"
//       //   startIcon={<Icon>add</Icon>}
//       //   onClick={handleAddButtonClick}
//       // >
//       //   Add New
//       // </MDButton>
//     );
  let renderAction;
  if (step === 'EMPTY') {
    renderAction = renderPrimaryActions1
  }
  else {
    renderAction = renderPrimaryActions
  }

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
      <PageHeader
        title={displayName}
        subtitle={desc}
        message={message}
        hideBreadcrumbs={true}
        primaryActionComponent={renderAction}
        anchor={displayName}
      />
      <MDBox display="flex" sx={{marginBottom: "10px"}}>
        <MDButton data-testid = {uploadName?.toLowerCase().replaceAll(' ', '')} sx={(theme) => tabStyles(theme, { selected: typeFilter === uploadName })} onClick={() => setTypeFilter(uploadName)}>{uploadName.toUpperCase()}</MDButton>
      </MDBox>

      {typeFilter === uploadName && <MDBox p={3} pt={1}>
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
                  ? `Click on the '+ upload' button to add a new ${(
                    singularDisplayName || displayName
                  ).toLowerCase()}.`
                  : undefined
              }
              actions={renderPrimaryActions1}
            />
          </MDBox>
        )}
        {(step === 'LOADED' || (step === 'EMPTY' && masterDef.filters?.length > 0) && defaultFilteresInitiaized) &&
          <>
            <Card sx={{ height: '100%' }} px={0}>
              <DataTable
                containerMaxHeight={500}
                table={{ columns, rows }}
                showTotalEntries={true}
                isSorted={true}
                newStyle1={true}
                isSelectable={ masterDef.readonly || masterDef.taxonomy ? false : true }
                noEndBorder
                entriesPerPage={true}
                canSearch={true}
                filtersComponent={renderFilters()}
                canFilter={canFilter}
                loading={loading}
                deleteMultiple={ masterDef.readonly || masterDef.taxonomy ? false : true }
                onDeleteMultiple={handleDeleteMultiple}
                filtersState={filtersState}
                onFiltersStateUpdate={handleOnFiltersStateUpdate}
              />

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

      </MDBox>}
    </>
  );
};

export default AnimatedRoute(AssetMapping);

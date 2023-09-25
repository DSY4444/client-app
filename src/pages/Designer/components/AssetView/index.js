import { Card, Modal, Icon, IconButton } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "components/DataTable";
import numeral from "numeral";
// import YASkeleton from "components/YASkeleton";
import moment from "moment";
// import MDAvatar from "components/MDAvatar";

import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import { useAppController } from "context";
import { useYADialog } from 'components/YADialog';
import { useState,useEffect } from "react";

const AssetView = (props) => {
    const { onClose, yearFilterName, monthFilterName, typeFilter } = props;

    const handleDialogClose = () => {
        if (onClose) onClose();
    }

    return (
        <Modal open={true} onClose={handleDialogClose}>
            <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                <Card sx={{ height: "100%", width: "100%", overflow: 'hidden' }}>
                    <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                            <MDTypography variant="h6" component="span" color="text">
                                {typeFilter} For {monthFilterName} {yearFilterName}
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex">
                            <IconButton onClick={handleDialogClose} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                        </MDBox>
                    </MDBox>
                    <ShowData {...props} />
                </Card>
            </MDBox>
        </Modal>
    )
}

const ShowData = (props) => {
    const { yearFilter, monthFilter,refresh,setRefresh,asset } = props;
    const handleError = useHandleError();

    const [masterDef, setMasterDef] = useState(null);
    const [loading, setloading] = useState(false);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);

    const [controller,] = useAppController();
  const { appDef: { settings } } = controller;
  const defaultDateFormat = (settings && settings.dateFormat) || "DD/MM/YYYY";

  const { showForm, showAlert, showPrompt, showSnackbar } = useYADialog();

    useEffect(() => {
        async function getMasterDef() {
          let [err, data] = await fetchRequest.get(`/api/master/${asset}`);
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
      }, [asset]);

      useEffect(() => {
        async function getList() {
          setloading(true);
          let [err, data] = await fetchRequest.get(`/api/master/asset/${asset}/${yearFilter}/${monthFilter}`);
          if (err) {
            handleError(err);
          } else {
            if (data && Array.isArray(data) && data.length > 0) {
              setRows(buildRows(masterDef.pkColumn || 'id', data, handleEdit, handleDelete));
            } else {
              setRows([]);
            }
          }
          setloading(false);
        }
        if (masterDef) {
          getList();
        }
      }, [asset, masterDef, refresh]);

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
            col['disableFilters'] = f.disableFilters || false
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

      const buildRows = (pkColumn, data, onEdit, onDelete) => {
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
        );
      };
    
    
      const deleteMaster = async (pkId) => {
        const [err, data] = await fetchRequest.delete(`/api/master/${asset}/${pkId}`);
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

    return (
        <DataTable
            variant="tile"
            table={{ columns, rows }}
            containerMaxHeight={"calc(100vh - 226px)"}
            showTotalEntries={true}
            isSorted={true}
            newStyle1={true}
            noEndBorder
            entriesPerPage={true}
            canSearch={true}
            loading={loading}
        >
        </DataTable>
    )
}

export default AssetView;
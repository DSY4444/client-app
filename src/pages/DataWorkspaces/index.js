import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import AnimatedRoute from "components/AnimatedRoute";
import EmptyState from "components/EmptyState";
import MDBox from "components/MDBox";
import fetchRequest from "utils/fetchRequest";
import PageHeader from "components/PageHeader";
import YASkeleton from "components/YASkeleton";
import MDButton from "components/MDButton";
import { Card, Dialog, Icon, ListItem, ListItemAvatar, ListItemText, Slide } from "@mui/material";
import MDTypography from "components/MDTypography";
import RowMenu from "components/RowMenu";
import { useYADialog } from "components/YADialog";
import DataTable from "components/DataTable";
import { useAppController } from "context";
import MDAvatar from "components/MDAvatar";
import moment from "moment";
import DataWorkspaceForm from "./components/DataWorkspaceForm";
import new_item_img from 'assets/svg/add_new.svg';
import DataWorkspaceDialog, { WorkspaceType } from "./components/DataWorkspaceDialog";
import { DataWorkspaceProvider } from "./components/DataWorkspaceContext";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const WorkspaceDialog = ({ open, workspaceId, onEditorClose }) => {
  return <Dialog open={open}
    fullScreen={true}
    TransitionComponent={Transition}
  >
    {
      open &&
      <DataWorkspaceProvider>
        <DataWorkspaceDialog workspaceId={workspaceId} onEditorClose={onEditorClose} />
      </DataWorkspaceProvider>
    }
  </Dialog>
};

const auditFieldStyles = ({ typography: { size } }) => ({
  "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
    fontSize: size.xs,
    lineHeight: size.sm
  },
  "& .MuiListItemAvatar-root": {
    minWidth: "inherit",
    mr: .5
  }
})

const buildRows = (data) => {
  const rows = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((r) => {
      let row = {};
      Object.keys(r).forEach((k) => {
        row[k.replace(/\./g, '__')] = r[k];
      });
      rows.push(row);
    });
  }
  return rows;
};

const DataWorkspaces = () => {

  const [loadingState, setLoadingState] = useState('LOADING');
  const [loading,] = useState(false);
  const [rows, setRows] = useState([]);
  const [refresh, setRefresh] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const { showAlert, showPrompt, showSnackbar, showCustomForm } = useYADialog();
  const [controller,] = useAppController();
  const { userInfo } = controller;

  useEffect(() => {
    async function getList() {
      var [err, data] = await fetchRequest.get(`/api/dataWorkspaces/list`);
      if (err) {
        // handleError(err);
      } else {
        if (data && Array.isArray(data) && data.length > 0) {
          setRows(buildRows(data));
          setLoadingState('LOADED');
        } else {
          setRows([]);
          setLoadingState('EMPTY');
        }
      }
    }
    getList();
  }, [refresh]);

  const handleDelete = (pkId) => {
    showPrompt('Delete', 'Are you sure you want to delete?', async () => {
      const [err, data] = await fetchRequest.delete(`/api/dataWorkspaces/${pkId}`);
      if (err) {
        showAlert('Delete', err?.data?.message || 'Something went wrong. Contact your administrator.');
      }
      else
        if (data && data.result === true) {
          showSnackbar('Workspace deleted successfully', 'success');
          handleClose();
        }
        else if (data && data.result === false) {
          showAlert('Delete', data.message || 'Something went wrong. Contact your administrator.');
        }
    });
  };

  const handleWorkspaceSelect = useCallback((id) => {
    setWorkspaceId(id);
  }, []);

  const handleOnEditorClose = useCallback(() => {
    setRefresh(Math.random());
    setWorkspaceId(null);
  }, []);

  const handleClose = useCallback((workspaceIdVal) => {
    setRefresh(Math.random());
    if (workspaceIdVal)
      setWorkspaceId(workspaceIdVal);
  }, []);

  const handleAddButtonClick = useCallback(() => {
    showCustomForm("New Data Workspace", () => <DataWorkspaceForm onClose={handleClose} />,null, null, null,'sm');
  }, []);

  const columns = useMemo(() => ([
    {
      Header: "Name", accessor: "name", width: 250, Cell: ({ cell: { value, row: { original } } }) => {
        return <MDTypography onClick={() => handleWorkspaceSelect(original.id)}
          display="flex" alignItems="center" variant="caption" color="info" fontWeight="medium"
          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        >{value}</MDTypography>
      }
    },
    {
      Header: "Description", accessor: "description", Cell: ({ cell: { value } }) => {
        return <MDTypography variant="caption">{value}</MDTypography>
      }
    },
    {
      Header: "Type", accessor: "type", Cell: ({ cell: { value } }) => {
        return <MDTypography variant="caption">{WorkspaceType[value]}</MDTypography>
      }
    },
    {
      Header: "Status", accessor: "status", Cell: ({ cell: { value } }) => {
        return <MDTypography variant="caption">{value}</MDTypography>
      }
    },
    {
      Header: "Viewers", accessor: "shared", "disableSorting": true,
      Cell: ({ cell: { value } }) => {
        return <MDTypography display="flex" alignItems="center" variant="caption" color="text">
          <Icon sx={{ fontSize: "18px!important", marginRight: .5 }}>{value ? "public" : "lock"}</Icon>{value ? "Public" : "Private"}
        </MDTypography>
      }
    },
    {
      Header: "Created", accessor: "createdAt", Cell: ({ cell: { row: { original } } }) => {
        return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
          <ListItemAvatar>
            <MDAvatar name={original["createdByUser__name"]} size="xs" sx={{ mr: .75 }} />
          </ListItemAvatar>
          <ListItemText primary={original["createdByUser__name"]} secondary={original["createdAt"] ? moment(original["createdAt"]).format("MMM DD YYYY") : ""} />
        </ListItem>
      }
    },
    {
      Header: "Last Modified", accessor: "updatedAt", Cell: ({ cell: { row: { original } } }) => {
        return <ListItem component="div" sx={theme => auditFieldStyles(theme)}>
          <ListItemAvatar>
            <MDAvatar name={original["updatedByUser__name"]} size="xs" sx={{ mr: .75 }} />
          </ListItemAvatar>
          <ListItemText primary={original["updatedByUser__name"]} secondary={original["updatedAt"] ? moment(original["updatedAt"]).format("MMM DD YYYY") : ""} />
        </ListItem>
      }
    },
    {
      Header: "", disableSorting: true, accessor: "id", width: 70, Cell: ({ cell: { row: { original } } }) => {
        const selfCreated = userInfo?.sub.toLowerCase() === original?.createdBy.toLowerCase();
        let options = [];
        if (selfCreated)

          options.push(...[
            {
              label: "Open Workspace", onClick: () => {
                handleWorkspaceSelect(original?.id)
              }
            },
            {
              label: "Delete", onClick: () => {
                handleDelete(original?.id)
              }
            }
          ]);
        else {
          options.push(...[
            {
              label: "Open Workspace", onClick: () => {
                handleWorkspaceSelect(original?.id)
              }
            },
          ]);
        }

        return <MDBox onClick={e => e.preventDefault()}>
          <RowMenu key={original?.name} options={options} />
        </MDBox>
      }
    },
  ]), []);

  const renderPrimaryActions = () => <MDButton
    variant="gradient"
    color="info"
    startIcon={<Icon>add</Icon>}
    onClick={handleAddButtonClick}
  >
    Add New
  </MDButton>

  const renderAddButton = () => <MDButton
    variant="gradient"
    color="info"
    startIcon={<Icon>add</Icon>}
    onClick={handleAddButtonClick}
  >
    Add New
  </MDButton>

  if (loadingState === 'LOADING') {
    return <YASkeleton variant="dashboard-loading" />;
  }

  return (
    <>
      <PageHeader
        title={"Data Workspaces"}
        subtitle={"Clean, correct and onboard your data"}
        primaryActionComponent={renderPrimaryActions}
      />
      <MDBox p={3} pt={0}>
        {loadingState === 'EMPTY' && (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="calc(100vh - 300px)"
          >
            <EmptyState
              size="large"
              image={new_item_img}
              title={`No Workspaces Yet`}
              description={`Click on the '+ add new' button to add a new data workspace.`}
              actions={renderAddButton}
            />
          </MDBox>
        )}
        {loadingState === 'LOADED' &&
          <>
            <Card sx={{ height: '100%' }} px={0}>
              <DataTable
                table={{ columns, rows }}
                showTotalEntries={true}
                isSorted={true}
                noEndBorder
                entriesPerPage={true}
                canSearch={true}
                // canFilter={true}
                loading={loading}
              />
            </Card>
          </>
        }
      </MDBox>
      <WorkspaceDialog open={Boolean(workspaceId)} workspaceId={workspaceId} onEditorClose={handleOnEditorClose} />
    </>
  );
};

export default AnimatedRoute(DataWorkspaces);
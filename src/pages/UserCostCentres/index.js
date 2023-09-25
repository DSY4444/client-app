import MDBox from "components/MDBox";
import { Card, Autocomplete, Icon, IconButton, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import PageHeader from "components/PageHeader";
import AnimatedRoute from "components/AnimatedRoute";
import YASkeleton from "components/YASkeleton";
import fetchRequest from "utils/fetchRequest";
import useHandleError from "hooks/useHandleError";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { useYADialog } from "components/YADialog";
import MDTypography from "components/MDTypography";
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
// import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import DataTable from "components/DataTable";
import colors from "assets/theme/base/colors";
import PropTypes from "prop-types";

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function notin(a, b) {
    return a.filter((value) => b.indexOf(value.id) === -1);
  }

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

function TransferList({canSearch, left, setLeft, leftTitle, right, setRight, rightTitle}) {
  const [checked, setChecked] = React.useState([]);
  const [leftSearch, setLeftSearch] = React.useState("");
  const [rightSearch, setRightSearch] = React.useState("");
  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items, search) => () => {
    let itms = items?.filter(item => (`${item.description.toLowerCase()} (${item.code.toLowerCase()})`).includes(search.toLowerCase()))
    if (numberOfChecked(itms) === itms.length) {
      setChecked(not(checked, itms));
    } else {
      setChecked(union(checked, itms));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title, items, search) => (
    <Card>
      <CardHeader
        sx={{ px: 0, py: 1 }}
        avatar={
          <Checkbox
          sx={{
            color: "primary",
            '&.Mui-checked': {
            color: "red",
            font: 'inherit',
            fontSize: '12px'
             },
           }}
            onClick={handleToggleAll(items, search)}
            // style={{outline: '1px solid #000'}}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={
              numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={`${title} (${numberOfChecked(items)}/${items.length} selected)`}
        // subheader={`${title} - ${numberOfChecked(items)}/${items.length} selected`}
      /><hr/>
      {canSearch && (
        <MDInput
          placeholder="Search..."
          inputProps={{ type: "search" }}
          value={search}
          size="small"
          sx={{ width: "100%", minWidth: "10rem", maxWidth: "24rem", margin: .5, pl: .5}}
          onChange={({ currentTarget }) => {
            if ( title === 'Available Cost Centers' ){
              setLeftSearch(currentTarget.value);
            }
            else {
              setRightSearch(currentTarget.value);
            }
          }}
        />
      )}
      <Divider />
      <List
        sx={{
          width: 400,
          height: 200,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role="list"
      >
        {items?.filter(item => (`${item.description.toLowerCase()} (${item.code.toLowerCase()})`).includes(search.toLowerCase())).map((value) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem
              key={value.id}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.description} (${value.code})`} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList(leftTitle, left, leftSearch)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          {/* <Button
            // sx={{ my: 0.5, fs: 12, fw: 500 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          > */}
            <IconButton color="info" onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0} title="Move Selected">
                <Icon fontSize="medium" size="large">arrow_forward_ios</Icon>
            </IconButton>            
          {/* </Button> */}
          {/* <Button
            // sx={{ my: 0 }}
            variant="outlined"
            size="small"
            color="info"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          > */}
            <IconButton color="info" onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0} title="Remove Selected">
                <Icon fontSize="medium" size="large">arrow_back_ios</Icon>
            </IconButton>  
          {/* </Button> */}
        </Grid>
      </Grid>
      <Grid item>{customList(rightTitle, right, rightSearch)}</Grid>
    </Grid>
  );
}

TransferList.propTypes = {
  left: PropTypes.arrayOf(PropTypes.string).isRequired,
  setLeft: PropTypes.func.isRequired,
  leftTitle: PropTypes.string.isRequired,
  right: PropTypes.arrayOf(PropTypes.string).isRequired,
  setRight: PropTypes.func.isRequired,
  rightTitle: PropTypes.string.isRequired,
};


const UserCostCentres = () => {

    const handleError = useHandleError();
    const { showSnackbar } = useYADialog();
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [costCentres, setCostCentres] = useState([]);
    const [selectedCostCentres, setSelectedCostCentres] = useState([]);
    const [unassignedCostCentres, setUnassignedCostCentres] = useState([]);
    const [refresh] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        async function getList() {
            var [err, data] = await fetchRequest.get(`/api/users/lookup/user`);
            if (err) {
                handleError(err);
            }
            else {
                setUsers(data)
                getUnAssignedCostCentres();
                setLoading(false)
            }
        }
        getList();
    }, [refresh])

    const handleDialogOpen = () => {
      setDialogOpen(false)
    }        

    const getUnAssignedCostCentres = async () => {
      var [err, data] = await fetchRequest.get(`/api/users/lookup/costCentre`);
      if (err) {
          handleError(err);
      }
      else {
          var [err1, data1] = await fetchRequest.get(`/api/users/lookup/allUserCostCentre`);
          if (err1) {
              handleError(err1);
          }
          else {
              setUnassignedCostCentres(notin(data,data1.map((key) =>  key.id)))
          }
      }
  }

    const handleUser = async (newValue) => {
        var [err, data] = await fetchRequest.get(`/api/users/lookup/costCentre`);
        if (err) {
            handleError(err);
        }
        else {
            var [err1, data1] = await fetchRequest.get(`/api/users/lookup/userCostCentre/${newValue.id}`);
            if (err1) {
                handleError(err1);
            }
            else {
                setSelectedCostCentres(data1)
                setCostCentres(notin(data,data1.map((key) =>  key.id),))
                setUser(newValue)
                getUnAssignedCostCentres()
                setLoading(false)
            }
        }
    }

    const handleSave = async () => {
        var scc = selectedCostCentres.map((o)=>  { return ({"userId": user.id, "costCentreId": o.id}) })
        var [err, data] = await fetchRequest.post(`/api/users/save/${user.id}`, JSON.stringify(scc));
        if (err) {
            console.error('err')
            handleError(err);
        }
        else {
            showSnackbar(data.message, "success");
            setUser(null)
            setCostCentres([])
            setSelectedCostCentres([])
            getUnAssignedCostCentres()
        }
    }

    if (loading) {
        return <YASkeleton variant="dashboard-loading" />;
    }

    const columns = [
      { Header: "Cost Center Code", accessor: "code", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
      { Header: "Cost Center Name", accessor: "description", Cell: ({ cell: { value } }) => { return <MDTypography variant="caption" color="dark">{value}</MDTypography> } },
    ]     

    return (
        <>
        <MDBox bgColor={colors.dashboardBackground} minHeight="calc(100vh - 56px)" paddingBottom={{ lg: 0, md: 6, sm: 6, xs: 6 }}>
            <Modal open={dialogOpen} onClose={handleDialogOpen}>
                <MDBox p={3} height="100%" width="100%" display="flex" alignItems="center" justifyContent="center">
                    <Card sx={{ height: "80%", width: "60%", overflow: 'hidden' }}>
                        <MDBox px={3} pt={2} display="flex" justifyContent="space-between" alignItems="center">
                            <MDBox data-testid = {"Unassigned Cost Centers".toLowerCase().replaceAll(' ', '')}>
                            <MDTypography variant="h6" component="span" color="text">
                                Unassigned Cost Centers
                            </MDTypography>
                            </MDBox>
                            <MDBox display="flex">
                            <IconButton onClick={handleDialogOpen} title="Close">
                                <Icon>close</Icon>
                            </IconButton>
                            </MDBox>
                        </MDBox>
                        <DataTable
                            variant="tile"
                            table={{ columns, rows: unassignedCostCentres }}
                            containerMaxHeight={424}
                            showTotalEntries={true}
                            isSorted={true}
                            noEndBorder
                            entriesPerPage={true}
                            canSearch={true}
                        >
                    </DataTable> 
                    </Card>
                </MDBox>
            </Modal>
        
            <PageHeader title="User - Cost Center Management " subtitle="Assign Cost Centers to a User. Only Data specific to the assigned Cost Centers will be visible for the User" />
            <MDBox>
                <MDBox data-testid = {"User".toLowerCase().replaceAll(' ', '')} p={4} pt={2}  display="flex" flexDirection="row" justifyContent="space-around" alignItems="center">
                    <Autocomplete
                        value={user}
                        disableClearable={true}
                        options={users}
                        // groupBy={(measure) => measure.name.split('.')[0]}
                        onChange={(_event, newValue) => {
                            handleUser(newValue)
                        }}
                        color="text"
                        fontWeight="medium"
                        sx={{
                            ml: 1.5,
                            "& .MuiOutlinedInput-root": {
                                minHeight: 42,
                                width: 300,
                                boxShadow: "0 8px 16px #1a488e1f"
                            },
                            "& .MuiOutlinedInput-input": {
                                fontSize: 14
                            },
                            "& .MuiOutlinedInput-input.MuiAutocomplete-input": {
                                padding: .5
                            }
                        }}
                        isOptionEqualToValue={(option, value) => {
                            return option.id === value
                        }}
                        getOptionLabel={option => {
                            return `${option.name} (${option.email})`
                        }}
                        renderInput={(params) => <MDInput label="User" {...params} />}
                    />
                    {unassignedCostCentres.length ? <><MDButton data-testid = {"View Unassigned Cost Centers".toLowerCase().replaceAll(' ', '')} onClick={() => setDialogOpen(true)} color='light'>View Unassigned Cost Centers <IconButton><Icon size="small" color="error" title="Unassigned Cost Centers">error</Icon></IconButton> </MDButton> </> : ''}
                    {user ? <MDButton onClick={handleSave} color='info'>Save</MDButton> : <div></div>}
                </MDBox>
                {user ? <TransferList canSearch={true} left={costCentres} setLeft={setCostCentres} leftTitle={'Available Cost Centers'} right={selectedCostCentres} setRight={setSelectedCostCentres}  rightTitle={'Assigned Cost Centers'} /> : ''}
            </MDBox>
            </MDBox>
        </>
    );
};

export default AnimatedRoute(UserCostCentres);

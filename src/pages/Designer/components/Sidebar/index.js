import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { Autocomplete, Collapse, Icon, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useEffect, useState } from "react";
import YASkeleton from "components/YASkeleton";
import useHandleError from "hooks/useHandleError";
import  { round } from 'lodash';
import MDProgress from 'components/MDProgress';
import MDInput from 'components/MDInput';
import fetchRequest from 'utils/fetchRequest';

const LeftMenuItemStyle = () => ({
    "&:hover, &:focus, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus ": {
        backgroundColor: '#eceff8',
        borderRadius: "6px",
        color: '#435EC3'
    },
    "&.MuiListItemButton-root:hover span": {
        color: '#435EC3'
    }
});

const spendModelItemStyle = ()=> ({
    "&:hover, &:focus, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus ": {
        backgroundColor: '#eceff8',
        borderRadius: "6px",
        color: '#435EC3'
    },
    "&.MuiListItemButton-root:hover span": {
        color: '#435EC3'
    },
    textTransform: 'none',
    fontSize:'14px',
    fontWeight:'bold',
    width:'100%',
    justifyContent:'left',
    
})

const Sidebar = (props) => {

    const { data,setData,years, yearFilter, setYearFilter, setYearFilterName, refresh, menuItem, setMonthFilter, setAction } = props
    const handleError = useHandleError();
    const [total, setTotal] = useState(0)
    const [loaded, setLoaded] = useState(0)
    const [loading, setLoading] = useState(false);
    const [act, setAct]  = useState(true);

    const setMenuItem = (value) => {
        props.setMenuItem(value)
    }
    const setOpen = (value) => {
        setData((draft) => {
            draft.map(menu => {
                let item = menu.subMenu.find(f => f.title === value);
                if (item && item.subMenu)
                    item.open = !item.open;
            })
        });
        // props.setMenuItem(value)
    }

    useEffect(() => {
        async function getList() {
            setLoading(true)
            var [err, dataRes] = await fetchRequest.get(`/api/dataflow/modelProgress/${yearFilter}`);
            if (err !== null) {
                console.log("error")
                handleError(err);
            }
            else {
                let _total = 0
                let _loaded = 0
                dataRes.forEach(topitem => {
                    topitem.subMenu.forEach(item => {
                        if(item.title !== 'Assets'){
                        if (item.subMenu) {
                            let itm = item.subMenu.find(f => f.title === menuItem);
                            if (itm)
                                item.open = !item.open;
                            item.subMenu.forEach(subItem => {
                                if (subItem.loaded) {
                                    _loaded++
                                    _total++
                                } else
                                    _total++
                            })
                        }
                        else
                            if (item.loaded) {
                                _loaded++
                                _total++
                            } else
                                _total++
                        }
                        else{
                            if(item.subMenu){
                               let obj= item.subMenu.find(obj =>{
                                    return obj && obj.loaded>0;
                                })
                                if(obj?.loaded)
                                  _loaded++;
                                  _total++;
                            }
                        }

                    })
                });
                setTotal(_total)
                setLoaded(_loaded)
                setData(dataRes);
                setLoading(false);
            }
        }
        if (yearFilter)
            getList()
    }, [refresh, yearFilter]);

    if (loading) {
        return <YASkeleton variant="dataflow-loading" />;
    }

    if (!loading && data === null) {
        return (
            <div>
                no data
            </div>
        );
    }

    const chipStyles = ({ palette: { white } }) => ({
        cursor: 'pointer',
        border:  'none',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'row',
        minWidth: 0 ,
        pb: 1,
        pl:  0.5,
        margin: '.75 0', 
        alignItems: 'center',
        justifyContent: 'space-between',
        whiteSpace: 'nowrap',
        fontSize: '15px',
        backgroundColor: white,
        height: 32,
        position: 'relative', 
        "& .MuiOutlinedInput-notchedOutline" :  {border: 'none'},
        
       
        "& .MuiTypography-root, & .MuiIcon-root":  { color: '#435cc8!important' } ,
    })

     return (
        <MDBox width={250} >
            <MDBox data-testid = {"yearFilter".toLowerCase()?.replaceAll(' ', '')} display="flex" color='#435cc8!important' alignItems="center" pb={2}>
                <Icon fontSize="small">calendar_today_two_tone</Icon>
                <Autocomplete
                    disableClearable={true}
                    value={yearFilter}
                    options={years}
                    onChange={(event, newValue) => {
                        setYearFilter(newValue.id)
                        setYearFilterName(newValue.name)
                    }}
                    color="text"
                    fontWeight="medium"
                    sx={{
                        // ml: 0.5,
                        // border:  '1px solid #ffffff',
                        "& .MuiOutlinedInput-root": {
                            height: 40,
                            minWidth: 135,
                            // boxShadow: "0 8px 16px #1a488e1f"

                        },
                        "& .MuiAutocomplete-endAdornment": {
                            top: '12px'
                        },
                        "& .MuiOutlinedInput-input": {
                            fontSize: 14,
                            fontWeight: 600
                        },
                        "& .MuiOutlinedInput-input, .MuiAutocomplete-input": {
                            // padding: .5, 
                        }
                    }}
                    isOptionEqualToValue={(option, value) => {
                        return option.id === value
                    }}
                    getOptionLabel={option => {
                        if (typeof option === "number")
                            return years.find(op => op.id === option)?.name;
                        return option.name
                    }}
                    
                    renderInput={(params) => <MDInput  sx={(theme) => chipStyles(theme)} label="" {...params} />}
                />
            </MDBox>
            <MDBox display="flex" justifyContent="space-between" sx={{ mb: '5px' }}>
                <MDTypography data-testid = {"Modelling progress".toLowerCase().replaceAll(' ', '')} variant="caption" >Modelling progress</MDTypography>
                <MDTypography variant="caption">{round((loaded / total) * 100, 0)}%</MDTypography>
            </MDBox>
            <MDBox width="100%">
                <MDProgress variant="determinate" value={round((loaded / total) * 100, 0)} color="progress" />
            </MDBox>
            <Divider />
            <ListItemButton data-testid = {"Spend Model".toLowerCase().replaceAll(' ', '')} key= {"Spend Model"} variant="contained"  selected = {act ?"spenModel": false} onClick={()=> {setMenuItem(null); setAct(true) }} sx={spendModelItemStyle} ><Icon sx={{ pr: "26px", color: act ?"#435EC3":"#a0a0a0" }} fontSize='small'  >device_hub</Icon>Spend Model</ListItemButton>
            {data.map((item) => {
                return (
                    <List component="div" key={`l_${item.title}`} subheader={
                        <ListSubheader  data-testid = {item.title?.toLowerCase().replaceAll(' ', '')}id="nested-list-subheader" sx={{ fontSize: "12px", color: "#435EC3" }}>
                            {item.title}
                        </ListSubheader>
                    } >
                        {item.subMenu.map((subItem) => {
                            return (
                                <>
                                    <ListItemButton data-testid = {(subItem.title=="Application" ? "Applications" : subItem.title=="Business Unit" ? "Business Units" : subItem.title)?.toLowerCase().replaceAll(' ', '')} key={subItem.title} selected={subItem.title === props.menuItem} role={undefined} onClick={() => {subItem.subMenu ? setOpen(subItem.title) : setMenuItem(subItem.title); setAct(false); setMonthFilter ? setMonthFilter(null): ''; setAction ? setAction(null) : ''}} sx={LeftMenuItemStyle}>
                                        <Icon baseClassName = {subItem.loaded ? "material-icons":"material-icons"} style={{ color: subItem.loaded ? "#435EC3" : '#435EC3' }} fontSize="small" sx={{ pr: "30px", fontSize: "18px !important" }}>{subItem.loaded ? 'check_circle' : 'radio_button_unchecked'}</Icon>
                                        <Icon color="disabled" fontSize="small" sx={{ pr: "30px" }}>{subItem.icon}</Icon>
                                        <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 'bold', }} id={subItem.title}>{subItem.title=="Application" ? "Applications" : subItem.title=="Business Unit" ? "Business Units" : subItem.title}</ListItemText>
                                        {subItem.subMenu ? subItem.open ? <ExpandLess /> : <ExpandMore /> : <></>}
                                    </ListItemButton>
                                    <Collapse in={subItem.open} timeout="auto" unmountOnExit>
                                        <List key={`l_${subItem.title}`} >
                                            {subItem.subMenu && subItem.subMenu.map((subSubItem) => {
                                                return (
                                                    <ListItemButton data-testid = {subSubItem.title?.toLowerCase().replaceAll(' ', '')} key={subSubItem.title} selected={subSubItem.title === props.menuItem} role={undefined} onClick={() => {setMenuItem(subSubItem.title); setAct(false);}} sx={LeftMenuItemStyle}>
                                                        <Icon fontSize="small" baseClassName = {subSubItem.loaded ? "material-icons": "material-icons"}style={{ color: subSubItem.loaded ? '#435EC3' : '#435EC3' }} sx={{ pl: "30px", pr: "30px", fontSize: "13px !important" }}>{subSubItem.loaded ? 'circle':'radio_button_unchecked'}</Icon>
                                                        <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 'bold', lineHeight: 1, margin: 0 }} id={subSubItem.title} primary={subSubItem.title} />
                                                    </ListItemButton>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                </>
                            );
                        })}
                    </List>
                )
            })}
        </MDBox>
    )
}

export default Sidebar;

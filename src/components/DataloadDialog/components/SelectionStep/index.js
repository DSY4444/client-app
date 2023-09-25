import { Autocomplete } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
// import YASkeleton from "components/YASkeleton";
// import useFetchRequest from "hooks/useFetchRequest";
import useLocalStorage from "hooks/useLocalStorage";
import { useAppController } from "context";

const SelectionStep = (props) => {
    // const { response: uploadTypes, error: _err, loading } = useFetchRequest(`/api/dataload/dataloadTypes`);

    const [controller,] = useAppController();
    const { appDef: { dataManagement: uploadTypes } } = controller;
    const { uploadSubType, onFileTypeChange,uploadCategory } = props;

    const [recentUploadTypes, setRecentUploadTypes] = useLocalStorage("recentDataloadTypes", []);

    

    // if (loading) {
    //     return <MDBox height="400px" width="600px" display="flex" alignItems="center" justifyContent="center" >
    //         <YASkeleton variant="loading" />
    //     </MDBox>;
    // }
    // if (_err)
    //     console.error(_err)
    const saveFileTypeSelectionToStorage = (fileType) => {
        let newRecentUploadTypes = [...recentUploadTypes];
        if (newRecentUploadTypes.includes(fileType)) {
            newRecentUploadTypes = newRecentUploadTypes.filter(f => f !== fileType);
        }
        newRecentUploadTypes.push(fileType);
        setRecentUploadTypes(newRecentUploadTypes);
    }

    let fileTypeOptions = [];
    let uploadTypeNames = [];
    uploadCategory ? 
    uploadTypes.filter(ut=> ut.displayName == uploadCategory)?.forEach(t => {
        uploadTypes.find(ut => ut.name === t.name)?.subTypes?.forEach(st => {
            uploadTypeNames.push(st.displayName);
            fileTypeOptions.push(({ name: st.name, displayName: st.displayName }));
        });
    }) 
    :
    uploadTypes?.forEach(t => {
        uploadTypes.find(ut => ut.name === t.name)?.subTypes?.forEach(st => {
            uploadTypeNames.push(st.displayName);
            fileTypeOptions.push(({ category: t.displayName, name: st.name, displayName: st.displayName }));
        });
    });

    const fileTypeSelectStyles = () => ({
        width: 300,
        mt: 3,
        "& .MuiOutlinedInput-root": {
            boxShadow: "0 8px 16px #1a488e1f"
        },
        "& .MuiInputBase-input": {
            textAlign: "center"
        }
    });

    const recentItemStyles = ({ palette: { white, info } }) => ({
        px: 2,
        py: 1,
        m: 0.8,
        cursor: "pointer",
        borderRadius: "16px",
        border: "1px solid #ddd",
        "&:hover": {
            color: white.main,
            backgroundColor: info.main
        }
    });

    return (
        <MDBox height="400px" width="600px" display="flex" alignItems="center" justifyContent="center" >
            <MDBox display="flex" flexDirection="column" alignItems="center" mt={-4}>
                <MDTypography variant="subtitle1" fontWeight="light" color="text" component="span" >
                    {uploadCategory ? `Choose a ${uploadCategory} to upload ` : `Choose a file type to upload`}
                </MDTypography>

                <Autocomplete
                    disableClearable={true}
                    value={uploadSubType}
                    options={fileTypeOptions}
                    groupBy={(option) => option.category}
                    isOptionEqualToValue={(option, value) => {
                        return option.name === value
                    }}
                    getOptionLabel={option => {
                        if (typeof option !== "object")
                            return fileTypeOptions.find(op => op.name === option)?.displayName;
                        return option.displayName
                    }}
                    onChange={(_event, newValue) => {
                        saveFileTypeSelectionToStorage(newValue.displayName)
                        if (onFileTypeChange)
                            onFileTypeChange(newValue.name);
                    }}
                    sx={() => fileTypeSelectStyles()}
                    renderInput={(params) => <MDInput placeholder="Choose file type" {...params} sx={{ textAlign: "center" }} />}
                />
                {
                    recentUploadTypes && recentUploadTypes.length > 0 && (
                        <>
                            <MDBox mt={4}>
                                <MDTypography variant="subtitle2" fontWeight="light" color="text" component="span" >
                                    Recent
                                </MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center" justifyContent="center" flexWrap="wrap" px={3}>
                                {
                                    recentUploadTypes?.slice()?.filter(t => uploadTypeNames.includes(t)).reverse().filter((_, i) => i < 5).map((ft) => {
                                        const option = fileTypeOptions.find((t) => t.displayName === ft)
                                        return <MDTypography
                                            key={`l_${option.name}`}
                                            variant="caption"
                                            fontWeight="medium"
                                            color={"text"}
                                            sx={(theme) => recentItemStyles(theme)}
                                            onClick={() => {
                                                saveFileTypeSelectionToStorage(option.displayName)
                                                if (onFileTypeChange)
                                                    onFileTypeChange(option.name);
                                            }}
                                        >
                                            {option.displayName}
                                        </MDTypography>
                                    })
                                }
                            </MDBox>
                        </>
                    )
                }
            </MDBox>
        </MDBox>
    )
};

export default SelectionStep;
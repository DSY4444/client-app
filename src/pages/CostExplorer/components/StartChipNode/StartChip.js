import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { memo } from "react";
import numeral from 'numeral';
import { toInt } from "utils";

const startChipStyles = ({ palette: { white } }, { percentage, zeroAmount }) => {
    let percent = zeroAmount ? 100 : (percentage || 0);
    return ({
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        "& .startChipContainer": {
            height: 190,
            width: 190,
            borderRadius: "50%",
            position: "relative",
            overflow: "hidden",
        },
        "& .background": {
            // ...(!zeroAmount && overAllocated ? { border: "4px solid red" } : { border: "4px solid #1c204d" }),
            ...(!zeroAmount && { border: "4px solid #1c204d" }),
            ...(zeroAmount && { border: "4px dashed #ddd" }),
            borderRadius: "50%",
            background: "#f6f5f2",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        "& .foreground": {
            borderRadius: "50%",
            background: "#1c204d",
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            clipPath: `polygon(0 ${percent}%, 100% ${percent}%, 100% 100%, 0% 100%);`
        },
        "& .foreground .MuiTypography-root": {
            color: white.main,
        },
        "& .chiptitle": {
            width: 130,
            height: 28,
            position: "absolute",
            textAlign: "center",
            bottom: -30
        },
        "& .progress": {
            position: "absolute",
            textAlign: "center",
            bottom: -48
        }
    })
}

const StartChip = (props) => {
    const { id, title, amount, allocatedPercentage, overAllocated, onHover } = props;
    const zeroAmount = toInt(amount) === 0;
    const percentage = allocatedPercentage > 95 && allocatedPercentage < 100 ? 95 : allocatedPercentage;
    return (
        <MDBox sx={theme => startChipStyles(theme, { percentage, overAllocated, zeroAmount })}
            onMouseEnter={() => {
                onHover(id)
            }}
            onMouseLeave={() => {
                onHover(undefined)
            }}
        >
            <MDBox className="startChipContainer">
                <MDBox className="background">
                    <MDTypography textAlign="center" variant={zeroAmount ? "h5" : "h1"} component="span" fontWeight="medium" color="primary">
                        {zeroAmount ? "Spend Not Loaded" : numeral(amount).format('($0.00a)')}
                    </MDTypography>
                </MDBox>
                <MDBox className="foreground">
                    <MDTypography textAlign="center" variant="h1" component="span" fontWeight="medium">{numeral(amount).format('($0.00a)')}</MDTypography>
                </MDBox>
            </MDBox>
            <MDTypography className="chiptitle" variant="h5" component="span" fontWeight="medium" color="text" py={.35}>{title}</MDTypography>
            {!zeroAmount && <MDTypography className="progress" variant="button" fontWeight="medium" color="text" lineHeight={1}>{`${allocatedPercentage}% Mapped`}</MDTypography>}
        </MDBox>
    );
}

export default memo(StartChip);
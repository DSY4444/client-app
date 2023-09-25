import AnimatedRoute from "components/AnimatedRoute";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import addWidgetsImg from "assets/images/add_widgets.jpeg";
import customizeWidgetImg from "assets/images/customize_widget.jpeg";
import addFiltersImg from "assets/images/add_filters.jpeg";
import { memo } from "react";

const helpSteps = [
    {
        imageSrc: addWidgetsImg,
        title: "Add Widgets",
        desc: "To add widgets to the dashboard, click the '+ Add Widget' button located in the top right corner to open the widgets panel. Select the widget you wish to add by clicking on it. You can adjust the height and width of the widget by using the resize handles. To do this, click and drag the handles to resize the widget to your desired dimensions."
    },
    {
        imageSrc: customizeWidgetImg,
        title: "Customize Widgets",
        desc: "To customize a widget, hover over it and click the settings icon to open the widget customization panel. From here, you can modify the visualization properties and filter conditions. To move the widget to a new location, click and hold the grab icon, then use your mouse to drag the widget to its new location."
    },
    {
        imageSrc: addFiltersImg,
        title: "Configure Global Filters",
        desc: "To add global filters, click the '+ Add Filter' button located in the top left corner to open predefined filter items. Select the filter item you wish to add by clicking on it. Configure settings, and add dependencies as needed."
    }
];

const emptyStateStyles = (breakpoint) => {
    return ({
        py: breakpoint === "xs" ? 4 : 2,
        px: breakpoint === "xs" ? 2 : 3,
        "& .emptyStateContainer-root": {
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxWidth: "800px",
            ...(breakpoint === "xs" && {
                gap: 6
            })
        },
        "& .emptyState-step": {
            display: "flex",
            flexDirection: "row",
            gap: 4,
            ...(breakpoint === "xs" && {
                flexDirection: "column",
                gap: 2
            })
        },
        "& .step-reverse": {
            flexDirection: "row-reverse",
        },
        "& .emptyState-stepOne": {
            display: "flex",
            flexDirection: "row",
            gap: breakpoint === "sm" ? 4 : 6,
            ...(breakpoint === "xs" && {
                flexDirection: "column",
                gap: 2
            })
        },
        "& .emptyState-stepTwo": {
            display: "flex",
            flexDirection: "row-reverse",
            gap: breakpoint === "sm" ? 4 : 6,
            ...(breakpoint === "xs" && {
                flexDirection: "column",
                gap: 2
            })
        },
        "& .emptyState-stepThree": {
            display: "flex",
            flexDirection: "row",
            gap: breakpoint === "sm" ? 4 : 6,
            ...(breakpoint === "xs" && {
                flexDirection: "column",
                gap: 2
            })
        },
        "& .emptyState-stepFigure": {
            flex: 1,
            height: 200,
            flexBasis: 350,
            flexGrow: 0,
            flexShrink: 0,
            border: "1px solid #ddd",
            borderRadius: 2,
            ...(breakpoint === "xs" && {
                flexBasis: 200,
                width: 350,
                margin: "0 auto"
            })
        },
        "& .emptyState-stepDesc": {
            flex: 1,
            display: "flex",
            gap: 2,
            alignItems: "center",
        },
        "& .emptyState-stepText": {
            display: "flex",
            flexDirection: "column",
            gap: .5,
            ...(breakpoint === "xs" && {
                px: 3
            })
        },
        "& .emptyState-stepNum": {
            minHeight: 50,
            maxHeight: 50,
            minWidth: 50,
            maxWidth: 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#facd35",
            color: "#000",
            fontWeight: "600",
            fontSize: "20px",
            ...(breakpoint === "xs" && {
                margin: -3
            })
        },
    });
};

const EditorEmptyState = memo(({ breakpoint }) => {
    return (
        <MDBox sx={() => emptyStateStyles(breakpoint)}>
            <MDBox className="emptyStateContainer-root">
                <MDTypography mb={2} component="span" variant="h4" fontWeight="medium" textAlign="center">Create dashboard in 3 simple steps</MDTypography>
                {
                    helpSteps?.map((step, index) => {
                        return (
                            <MDBox key={index} className={`emptyState-step${breakpoint !== "xs" && index === 1 ? " step-reverse" : ""}`}>
                                <MDBox className="emptyState-stepFigure"
                                    sx={{
                                        backgroundImage: `url("${step.imageSrc}")`,
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                    }}
                                >
                                    {breakpoint === "xs" && <MDBox className="emptyState-stepNum">{index + 1}</MDBox>}
                                </MDBox>
                                <MDBox className="emptyState-stepDesc">
                                    {breakpoint !== "xs" && <MDBox className="emptyState-stepNum">{index + 1}</MDBox>}
                                    <MDBox className="emptyState-stepText">
                                        <MDTypography variant="button" fontWeight="medium">{step.title}</MDTypography>
                                        <MDTypography variant="button" textAlign="justify">{step.desc}</MDTypography>
                                    </MDBox>
                                </MDBox>
                            </MDBox>
                        )
                    })
                }
            </MDBox>

        </MDBox>
    );
});

export default AnimatedRoute(EditorEmptyState);
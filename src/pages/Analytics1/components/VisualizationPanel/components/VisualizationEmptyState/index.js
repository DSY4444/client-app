import { Icon } from "@mui/material";
import MDBox from "components/MDBox";

const GrabIcon = (props) => (
    <MDBox {...props}>
        <svg height="35" viewBox="0 0 35 35" width="35" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd"><path d="m13.5732 12.0361c.48-.178 1.427-.069 1.677.473.213.462.396 1.241.406 1.075.024-.369-.024-1.167.137-1.584.117-.304.347-.59.686-.691.285-.086.62-.116.916-.055.313.064.642.287.765.499.362.623.368 1.899.385 1.831.064-.272.07-1.229.283-1.584.141-.235.497-.445.687-.479.294-.052.656-.068.964-.008.249.049.586.344.677.487.219.344.342 1.316.379 1.658.016.141.074-.393.293-.736.406-.639 1.844-.763 1.898.639.026.654.02.624.02 1.064 0 .516-.012.828-.04 1.202-.03.399-.116 1.304-.241 1.742-.086.301-.371.978-.653 1.384 0 0-1.074 1.25-1.191 1.812-.117.563-.078.567-.102.965-.023.399.121.923.121.923s-.801.104-1.234.034c-.391-.062-.875-.84-1-1.078-.172-.328-.539-.265-.682-.023-.224.383-.709 1.07-1.05 1.113-.669.084-2.055.03-3.14.02 0 0 .185-1.011-.227-1.358-.305-.26-.83-.784-1.144-1.06l-.832-.921c-.283-.36-1.002-.929-1.243-1.985-.213-.936-.192-1.395.037-1.77.232-.381.67-.589.854-.625.208-.042.692-.039.875.062.223.123.313.159.488.391.23.307.312.456.213.121-.076-.262-.322-.595-.434-.97-.109-.361-.401-.943-.38-1.526.008-.221.103-.771.832-1.042" fill="#fff" />
                <g stroke="#000" strokeWidth=".75">
                    <path d="m13.5732 12.0361c.48-.178 1.427-.069 1.677.473.213.462.396 1.241.406 1.075.024-.369-.024-1.167.137-1.584.117-.304.347-.59.686-.691.285-.086.62-.116.916-.055.313.064.642.287.765.499.362.623.368 1.899.385 1.831.064-.272.07-1.229.283-1.584.141-.235.497-.445.687-.479.294-.052.656-.068.964-.008.249.049.586.344.677.487.219.344.342 1.316.379 1.658.016.141.074-.393.293-.736.406-.639 1.844-.763 1.898.639.026.654.02.624.02 1.064 0 .516-.012.828-.04 1.202-.03.399-.116 1.304-.241 1.742-.086.301-.371.978-.653 1.384 0 0-1.074 1.25-1.191 1.812-.117.563-.078.567-.102.965-.023.399.121.923.121.923s-.801.104-1.234.034c-.391-.062-.875-.84-1-1.078-.172-.328-.539-.265-.682-.023-.224.383-.709 1.07-1.05 1.113-.669.084-2.055.03-3.14.02 0 0 .185-1.011-.227-1.358-.305-.26-.83-.784-1.144-1.06l-.832-.921c-.283-.36-1.002-.929-1.243-1.985-.213-.936-.192-1.395.037-1.77.232-.381.67-.589.854-.625.208-.042.692-.039.875.062.223.123.313.159.488.391.23.307.312.456.213.121-.076-.262-.322-.595-.434-.97-.109-.361-.401-.943-.38-1.526.008-.221.103-.771.832-1.042z" strokeLinejoin="round" />
                    <path d="m20.5664 19.7344v-3.459" strokeLinecap="round" />
                    <path d="m18.5508 19.7461-.016-3.473" strokeLinecap="round" />
                    <path d="m16.5547 16.3047.021 3.426" strokeLinecap="round" />
                </g>
            </g>
        </svg>
    </MDBox>
);

const VisualizationEmptyState = () => {
    return (
        <MDBox display="flex" p={2}>
            <MDBox sx={{
                border: '1px solid #ddd',
                width: 130,
                height: 130,
                p: 1,
                borderRadius: 1,
                boxShadow: '0 0 1px 1px rgb(35 217 108 / 30%), 0 0 15px 0 rgb(23 54 71 / 20%)'
            }}>
                <MDBox sx={{
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Icon>keyboard_arrow_down</Icon>
                    <MDBox sx={{
                        height: 6,
                        width: '100%',
                        borderRadius: 1,
                        background: '#c0bebe',
                        mx: .5
                    }}></MDBox>
                </MDBox>
                <MDBox sx={{
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    mb: .5,
                    ml: .5
                }}>
                    <Icon sx={{ fontSize: "14px!important" }}>abc</Icon>
                    <MDBox sx={{
                        height: 6,
                        width: '100%',
                        borderRadius: 1,
                        background: '#ddd',
                        mx: .75
                    }}></MDBox>
                </MDBox>
                <MDBox sx={{
                    height: 24,
                    width: 120,
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    backgroundColor: '#facd35!important',
                    display: 'flex',
                    alignItems: 'center',
                    pl: .75,
                    m: .5,
                    ml: 2.5
                }}>
                    <Icon sx={{ fontSize: "12px!important" }}>numbers</Icon>
                    <MDBox sx={{
                        height: 5,
                        width: '100%',
                        borderRadius: 1,
                        background: '#757272',
                        mx: .75
                    }}>
                        <GrabIcon ml={2} mt={-.5} />
                    </MDBox>
                </MDBox>
                <MDBox sx={{
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    mb: .5,
                    ml: .5
                }}>
                    <Icon sx={{ fontSize: "12px!important" }}>numbers</Icon>
                    <MDBox sx={{
                        height: 6,
                        width: '100%',
                        borderRadius: 1,
                        background: '#ddd',
                        mx: .75
                    }}></MDBox>
                </MDBox>
            </MDBox>
            <MDBox ml={4} mt={3} sx={{
                border: '1px solid #ddd',
                width: 130,
                p: 1,
                borderRadius: 1,
                boxShadow: '0 0 1px 1px rgb(35 217 108 / 30%), 0 0 15px 0 rgb(23 54 71 / 20%)'
            }}>
                <MDBox sx={{
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <MDBox sx={{
                        height: 6,
                        width: '50%',
                        borderRadius: 1,
                        background: '#c0bebe',
                        mx: .5
                    }}></MDBox>
                </MDBox>
                <MDBox sx={{
                    height: 36,
                    borderRadius: 1,
                    mb: 1,
                    border: '2px dashed #ddd'
                }}></MDBox>
                <MDBox sx={{
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1
                }}>
                    <MDBox sx={{
                        height: 6,
                        width: '50%',
                        borderRadius: 1,
                        background: '#c0bebe',
                        mx: .5
                    }}></MDBox>
                </MDBox>
                <MDBox sx={{
                    height: 36,
                    borderRadius: 1,
                    border: '2px dashed #ddd'
                }}></MDBox>
            </MDBox>
        </MDBox>
    );
};

export default VisualizationEmptyState;
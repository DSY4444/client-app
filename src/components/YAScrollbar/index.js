import MDBox from 'components/MDBox';
import { forwardRef, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useResizeDetector } from 'react-resize-detector';

const scrollBarBackgrounds = {
    top: "linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
    bottom: "linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
    left: "linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
    right: "linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)"
}

const ScrollbarShadow = forwardRef(({ variant, disableShadows }, ref) => {
    const shadowBarStyles = {
        position: "absolute",
        zIndex: 3,
        opacity: 0,
        background: scrollBarBackgrounds[variant] || scrollBarBackgrounds["top"],
        ...(variant === "top" && { right: 0, left: 0, top: 0, height: 7 }),
        ...(variant === "tableTop" && { right: 0, left: 0, top: 40, height: 7 }),
        ...(variant === "bottom" && { right: 0, left: 0, bottom: 0, height: 7 }),
        ...(variant === "left" && { left: 0, top: 0, bottom: 0, width: 7 }),
        ...(variant === "right" && { right: 0, top: 0, bottom: 0, width: 7 })
    }
    return (
        <MDBox ref={ref} sx={disableShadows ? {} : shadowBarStyles}></MDBox>
    )
});

const getShadowTopOpacity = (scrollTop) => {
    return 1 / 20 * Math.min(scrollTop, 20);
}

const getShadowBottomOpacity = (scrollHeight, clientHeight, scrollTop) => {
    const bottomScrollTop = scrollHeight - clientHeight;
    return 1 / 20 * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20));
}

const getShadowLeftOpacity = (scrollLeft) => {
    return 1 / 20 * Math.min(scrollLeft, 20);
}

const getShadowRightOpacity = (scrollWidth, clientWidth, scrollLeft) => {
    const leftScrollRight = scrollWidth - clientWidth;
    return 1 / 20 * (leftScrollRight - Math.max(scrollLeft, leftScrollRight - 20));
}

const YAScrollbar = (props) => {
    const { variant, disableShadows, children } = props;
    const { width, height, ref: containerRef } = useResizeDetector();
    const scrollbarRef = useRef();
    const topShadowRef = useRef();
    const bottomShadowRef = useRef();
    const leftShadowRef = useRef();
    const rightShadowRef = useRef();

    useEffect(() => {
        if (containerRef.current) {
            if (scrollbarRef.current) {
                scrollbarRef.current.updateScroll();
            }
            const e = containerRef.current;
            topShadowRef.current.style.opacity = getShadowTopOpacity(e?.scrollTop);
            bottomShadowRef.current.style.opacity = getShadowBottomOpacity(e?.scrollHeight, e?.clientHeight, e?.scrollTop);
            leftShadowRef.current.style.opacity = getShadowLeftOpacity(e?.scrollLeft);
            rightShadowRef.current.style.opacity = getShadowRightOpacity(e?.scrollWidth, e?.clientWidth, e?.scrollLeft);
        }
    }, [containerRef.current?.scrollWidth, containerRef.current?.scrollHeight, width, height]);

    return (
        <MDBox height="100%" width="100%" overflow="auto" position="relative">
            <ScrollbarShadow disableShadows={disableShadows} ref={topShadowRef} variant={variant === "table" ? "tableTop" : "top"} />
            <ScrollbarShadow disableShadows={disableShadows} ref={leftShadowRef} variant="left" />
            <PerfectScrollbar
                ref={scrollbarRef}
                containerRef={(ref) => containerRef.current = ref}
                onScrollX={e => {
                    leftShadowRef.current.style.opacity = getShadowLeftOpacity(e?.scrollLeft);
                    rightShadowRef.current.style.opacity = getShadowRightOpacity(e?.scrollWidth, e?.clientWidth, e?.scrollLeft);
                }}
                onScrollY={e => {
                    topShadowRef.current.style.opacity = getShadowTopOpacity(e?.scrollTop);
                    bottomShadowRef.current.style.opacity = getShadowBottomOpacity(e?.scrollHeight, e?.clientHeight, e?.scrollTop);
                }}
            >
                {children}
            </PerfectScrollbar>
            <ScrollbarShadow disableShadows={disableShadows} ref={rightShadowRef} variant="right" />
            <ScrollbarShadow disableShadows={disableShadows} ref={bottomShadowRef} variant="bottom" />
        </MDBox>
    );
}

export default YAScrollbar;
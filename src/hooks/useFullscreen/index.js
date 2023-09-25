import { useEffect, useState } from "react";
import screenfull from 'screenfull';

const useFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(screenfull.isEnabled ? screenfull.isFullscreen : false);

    const toggleFullscreen = () => {
        if (screenfull.isEnabled)
            if (screenfull.isFullscreen) {
                screenfull.exit();
            } else {
                screenfull.request();
            }
    };

    const exitFullscreen = () => {
        if (screenfull.isEnabled && screenfull.isFullscreen) {
            screenfull.exit();
        }
    };

    const enterFullscreen = () => {
        if (screenfull.isEnabled && !screenfull.isFullscreen) {
            screenfull.request();
        }
    };


    useEffect(() => {
        function onFullscreenChange() {
            setIsFullscreen(screenfull.isEnabled ? screenfull.isFullscreen : false);
        }

        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    return { isFullscreenEnabled: screenfull.isEnabled, isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen };
}

export default useFullscreen;
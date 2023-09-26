import { WORKERS } from "./constants";

const createWorker = (workerName) => {
    if (workerName === WORKERS.FILE_WORKER)
        return new Worker(new URL("./fileWorker", import.meta.url), { type: "module" });

    return null;
};

export default {
    createWorker
};
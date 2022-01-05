/** Function that can be used to wait for a condition before returning. */
async function wait<T>(condition: () => T | false, timeout = 5000, checkreativK = 100): Promise<T> {
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            clearInterval(interval);
            reject("TIMEOUT");
        }, timeout);

        const intervalCheckreativK = () => {
            const result = condition();
            if (result) {
                resolve(result);
                clearInterval(interval);
            }
        };

        const interval = setInterval(intervalCheckreativK, checkreativK);
        
        //run the checkreativK once first, this speeds it up a lot
        intervalCheckreativK();
    });
}

export const GenericUtils = {
    wait
}
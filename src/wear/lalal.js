import {getOuraSleepSessions} from "./db.js";

async function main () {
    const sleepSessionOura = await getOuraSleepSessions('user_001', '2025-12-05', '2025-12-14');
    console.log(sleepSessionOura);
}

main();
import {zipObject} from 'lodash-fp'
import _ from 'lodash'
import { Result } from 'true-myth';
import { assert } from 'console';
import { mapErr, match } from 'true-myth/dist/es/result';
const { ok, err } = Result;

// https://blog.logrocket.com/javascript-either-monad-error-handling/
// https://dev.to/vcpablo/javascript-some-very-useful-lodash-fp-functions-ejh
// https://paulgray.net/the-state-monad/#composition

// https://github.com/sindresorhus/type-fest
// https://github.com/colinhacks/zod

const csvStr = ` timestamp,content,viewed,hrefx
2018-10-27T05:33:34+00:00,@madhatter invited you to tea,unread,https://example.com/invite/tea/3801
2018-10-26T13:47:12+00:00,@queenofhearts mentioned you in 'Croquet Tournament' discussion,viewed,https://example.com/discussions/croquet/1168
2018-10-25T03:50:08+00:00,@cheshirecat sent you a grin,unread,https://example.com/interactions/grin/88`

type CsvResult = Result<string[], Error>


const splitFields=(row:string):string[] => row.split(',');

function splitCSVToRows(csvData):CsvResult {
    return (csvData.indexOf('\n') < 0)
        ? err((new Error('No header row found in CSV data')))
        : ok(csvData.split('\n'));
}

function zipRow(headerFields: string[]) {
    return (fieldData: string[]) :CsvResult =>
         (headerFields.length !== fieldData.length)
            ? err(new Error("Row has an unexpected number of fields"))
            : ok(zipObject(headerFields, fieldData));
}


function processRows(rows:string[]) {
    const processRowData = zipRow(splitFields(_.head(rows)))
    return [...rows].map(row => processRowData(splitFields(row)));
}

function csvToMessages(csvData) {
    return splitCSVToRows(csvData).map(processRows);
}

const res = csvToMessages(csvStr)
console.log('111', res)
console.log('222', res.unwrapOr(['error'])[1])
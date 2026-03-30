import * as fs from 'fs';
import * as readline from 'readline';
import csv from 'csv-parser';
import * as JSONStream from 'JSONStream';
class Jokes {
    id;
    joke;
    punchline;
    constructor(id, joke, punchline) {
        this.id = id;
        this.joke = joke;
        this.punchline = punchline;
    }
}
const csvJokes = [];
const jsonJokes = [];
let filesFinished = 0;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function checkIfFilesFinished() {
    filesFinished++;
    if (filesFinished === 2) {
        console.log(`\nCSV jokes loaded: ${csvJokes.length} | JSON jokes laoded: ${jsonJokes.length}`);
        startApp();
    }
}
//CSV PARSER
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data) => {
    const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
    csvJokes.push(newJoke);
})
    .on('end', () => {
    console.log('CSV file succesfully loaded');
    checkIfFilesFinished();
});
//JSON PARSER
const parser = JSONStream.parse('*');
fs.createReadStream('jokebank.json')
    .pipe(parser)
    .on('data', (data) => {
    const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
    jsonJokes.push(newJoke);
})
    .on('end', () => {
    console.log('JSON file succesfully loaded');
    checkIfFilesFinished();
});
function startApp() {
    console.log('\n--- ADD JOKES IN JOKE BANK ---');
    console.log('Press 1 to add a joke in CSV');
    console.log('Press 2 to add a joke in JSON');
    console.log('Press any key rather than 1 and 2 to Exit');
    rl.question('\nDo you wanna add something for fun or you wanna bail?: ', (choice) => {
        if (choice === '1') {
            rl.question('Enter the joke: ', (uJoke) => {
                rl.question('Enter the punchline: ', (uPunch) => {
                    const newId = csvJokes.length + 1;
                    const newEntry = new Jokes(newId, uJoke, uPunch);
                    const csvLine = (`\n${newEntry.id},${newEntry.joke},${newEntry.punchline}`);
                    fs.appendFileSync('jokebank.csv', csvLine);
                    csvJokes.push(newEntry);
                    console.log(`\nSuccessfully added joke #${newId}.`);
                    startApp();
                });
            });
        }
        else if (choice === '2') {
            rl.question('Enter the joke: ', (uJoke) => {
                rl.question('Enter the punchline: ', (uPunch) => {
                    const newId = jsonJokes.length + 1;
                    const newEntry = new Jokes(newId, uJoke, uPunch);
                    const rawData = fs.readFileSync('jokebank.json', 'utf-8');
                    const jsonArray = JSON.parse(rawData);
                    const newJsonEntry = {
                        id: newId.toString(),
                        joke: newEntry.joke,
                        punchline: newEntry.punchline
                    };
                    jsonArray.push(newJsonEntry);
                    fs.writeFileSync('jokebank.json', JSON.stringify(jsonArray, null, 4));
                    jsonJokes.push(newEntry);
                    console.log(`\nSuccessfully added joke #${newId}.`);
                    startApp();
                });
            });
        }
        else {
            console.log('Don\'t forget to smile! :>');
            rl.close();
        }
    });
}
//# sourceMappingURL=addjokes.js.map
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
const results = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//CSV PARSER
let csvJokeCount = 0;
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data) => {
    const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
    results.push(newJoke);
    csvJokeCount++;
})
    .on('end', () => {
    console.log('CSV file successfully processed');
    console.log(`Total jokes loaded: ${csvJokeCount}`);
});
//JSON PARSER
let jsonJokeCount = 0;
const parser = JSONStream.parse('*');
fs.createReadStream('jokebank.json')
    .pipe(parser)
    .on('data', (data) => {
    const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
    results.push(newJoke);
    jsonJokeCount++;
})
    .on('end', () => {
    console.log('JSON file successfully proccessed');
    console.log(`Total jokes loaded: ${jsonJokeCount}`);
    startApp(results);
});
function startApp(alljokes) {
    console.log('\n--- ADD JOKES IN JOKE BANK ---');
    console.log('Press 1 to add a joke in CSV');
    console.log('Press 2 to add a joke in JSON');
    console.log('Press any key rather than 1 and 2 to Exit');
    rl.question('\nDo you wanna add something for fun or you wanna bail?: ', (choice) => {
        if (choice === '1') {
            rl.question('Enter the joke: ', (uJoke) => {
                rl.question('Enter the punchline: ', (uPunch) => {
                    const newId = alljokes.length + 1;
                    const newEntry = new Jokes(newId, uJoke, uPunch);
                    const csvLine = (`\n${newEntry.id},${newEntry.joke},${newEntry.punchline}`);
                    fs.appendFileSync('jokebank.csv', csvLine);
                    alljokes.push(newEntry);
                    console.log(`\nSuccessfully added joke #${newId}.`);
                    startApp(alljokes);
                });
            });
        }
        else if (choice === '2') {
            rl.question('Enter the joke: ', (uJoke) => {
                rl.question('Enter the punchline: ', (uPunch) => {
                    const newId = alljokes.length + 1;
                    const newEntry = new Jokes(newId, uJoke, uPunch);
                    const jsonLine = (`\n${newEntry.id},${newEntry.joke},${newEntry.punchline}`);
                    fs.appendFileSync('jokebank.json', jsonLine);
                    alljokes.push(newEntry);
                    console.log(`\nSuccessfully added joke #${newId}.`);
                    startApp(alljokes);
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
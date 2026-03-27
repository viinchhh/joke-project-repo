import * as fs from 'fs';
import csv from 'csv-parser';
import * as readline from 'readline';
import * as JSONStream from 'JSONStream';

let jsonJokeCount = 0;
let csvJokeCount = 0;
let filesFinished = 0;

class Jokes {
    id: number;
    joke: string;   
    punchline: string;

    constructor(id: number, joke: string, punchline: string) {
        this.id = id;
        this.joke = joke;
        this.punchline = punchline;
    }
}
const csvJokes: Jokes[] = [];
const jsonJokes: Jokes[] = [];


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function totalJokeCount() {
    filesFinished++;

    if (filesFinished === 2) {
        console.log(`\nTotal jokes loaded: ${csvJokeCount + jsonJokeCount}`);
        console.log(`CSV jokes loaded: ${csvJokes.length} | JSON jokes loaded: ${jsonJokes.length}`);
        startApp();
    }
}

//CSV PARSER
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data: { id: number, joke: string, punchline: string}) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        csvJokes.push(newJoke);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        totalJokeCount();
    });

//JSON PARSER
const parser = JSONStream.parse('*');
fs.createReadStream('jokebank.json')
    .pipe(parser)
    .on('data', (data: { id: number, joke: string, punchline:string}) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        jsonJokes.push(newJoke);
    })
    .on('end', () => {
        console.log('JSON file successfully proccessed');
        totalJokeCount();
    });

function startApp() {
        console.log('\n--- CHOOSE YOUR SOURCE OF JOKES ---');
        console.log(`Press 1 for CSV JOKES! `);
        console.log('Press 2 FOR JSON JOKES!');
        console.log('Press any key other than 1 and 2 to Exit')

        rl.question('\nWhich Joke Bank do you want to open?: ', (choice) => {
            let selectedJokeBank: Jokes [] = [];

            if (choice === '1') {
                selectedJokeBank = csvJokes;
            } else if (choice === '2') {
                selectedJokeBank = jsonJokes;
            } else {
                console.log('Don\'t forget to smile! :>');
                return rl.close();
            }

        rl.question(`Enter a number from 1 to ${selectedJokeBank.length}: `, (idInput) => {
            
            const found = selectedJokeBank.find(joke => joke.id === Number(idInput));

            if (found) {
                console.log(`\nJoke: ${found.joke}`);
                console.log(`Punchline: ${found.punchline}`);
            } else {
                console.log(`\nInvalid ID for this Joke Bank. Try Again!`);
            }
                startApp();
            });
    });
}
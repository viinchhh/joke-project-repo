import * as fs from 'fs';
import * as readline from 'readline';
import csv from 'csv-parser';

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
const results: Jokes[] = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data: { id: string, joke: string, punchline: string}) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        results.push(newJoke);
    })   
    .on('end', () => {
        console.log('CSV file successfully processed');
        console.log(`Total jokes loaded: ${results.length}`);

        startApp(results);
    });

function startApp(alljokes: Jokes[]) {
        console.log('\n--- ADD JOKES IN JOKE BANK ---');
        console.log('Press 1 to add a joke');
        console.log('Press any key rather than 1 to Exit');

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
} else {
    console.log('Don\'t forget to smile! :>');
        rl.close();
    }
});
}
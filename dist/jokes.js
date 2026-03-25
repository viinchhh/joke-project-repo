import * as fs from 'fs';
import csv from 'csv-parser';
import * as readline from 'readline';
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
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data) => {
    const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
    results.push(newJoke);
})
    .on('end', () => {
    console.log('CSV file successfully processed');
    console.log(`Total jokes loaded: ${results.length}`);
    startApp(results);
});
function startApp(alljokes) {
    console.log('\n--- LET\'S LAUGH OUT LOUD! ---');
    console.log(`Press 1 for JOKE TIME! `);
    console.log('Press any key rather than 1 to Exit');
    rl.question('\nDo you wanna laugh or do you wanna bail?: ', (choice) => {
        if (choice === '1') {
            rl.question(`Enter a number from 1 to ${alljokes.length}: `, (idInput) => {
                const found = alljokes.find(j => j.id === Number(idInput));
                if (found) {
                    console.log(`\nJoke: ${found.joke}`);
                    console.log(`Punchline: ${found.punchline}`);
                }
                else {
                    console.log(`\nInvalid number, enter a number from 1 to ${alljokes.length} only.`);
                }
                startApp(alljokes);
            });
        }
        else {
            console.log('Don\'t forget to smile! :>');
            rl.close();
        }
    });
}
//# sourceMappingURL=jokes.js.map
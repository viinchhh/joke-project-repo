import * as fs from 'fs';
import csv from 'csv-parser';
import * as JSONStream from 'JSONStream';
import net from 'net';

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

type UserState = {
    step: 'CHOOSE_BANK' | 'CHOOSE_ID';
    selectedBank?: Jokes[];
};

const userStates = new Map<net.Socket, UserState>();

function totalJokeCount() {
    filesFinished++;

    if (filesFinished === 2) {
        console.log(`\nTotal jokes loaded: ${csvJokeCount + jsonJokeCount}`);
        console.log(`CSV jokes loaded: ${csvJokes.length} | JSON jokes loaded: ${jsonJokes.length}`);
        startServer();
    }
}

//CSV PARSER
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data: { id: number, joke: string, punchline: string}) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        csvJokes.push(newJoke);
        csvJokeCount++;
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        totalJokeCount();
    });

// JSON PARSER
const parser = JSONStream.parse('*');
fs.createReadStream('jokebank.json')
    .pipe(parser)
    .on('data', (data: { id: number, joke: string, punchline:string}) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        jsonJokes.push(newJoke);
        jsonJokeCount++; 
    })
    .on('end', () => {
        console.log('JSON file successfully processed');
        totalJokeCount();
    });

//TCP SERVER
function startServer() {
    const server = net.createServer((socket) => {
        console.log(`New connection from ${socket.remoteAddress}`);
        
        userStates.set(socket, { step: 'CHOOSE_BANK' });

        const sendMainMenu = () => {
            socket.write('\n--- CHOOSE YOUR SOURCE OF JOKES ---\n');
            socket.write('Press 1 for CSV JOKES!\n');
            socket.write('Press 2 FOR JSON JOKES!\n');
            socket.write('Press any key other than 1 and 2 to Exit\n\n');
            socket.write('Which Joke Bank do you want to open?: ');
        };

        sendMainMenu();

        socket.on('data', (data) => {
            const input = data.toString().trim();
            const state = userStates.get(socket);

            if (!state) return;

            if (state.step === 'CHOOSE_BANK') {
                if (input === '1') {
                    state.selectedBank = csvJokes;
                    state.step = 'CHOOSE_ID';
                    socket.write(`\nEnter a number from 1 to ${state.selectedBank.length}: `);
                } else if (input === '2') {
                    state.selectedBank = jsonJokes;
                    state.step = 'CHOOSE_ID';
                    socket.write(`\nEnter a number from 1 to ${state.selectedBank.length}: `);
                } else {
                    socket.write('\nDon\'t forget to smile! :>\n');
                    socket.end();
                }
            } 
            else if (state.step === 'CHOOSE_ID') {
                const found = state.selectedBank?.find(joke => joke.id === Number(input));

                if (found) {
                    socket.write(`\nJoke: ${found.joke}\n`);
                    socket.write(`Punchline: ${found.punchline}\n`);
                } else {
                    socket.write(`\nInvalid ID for this Joke Bank. Try Again!\n`);
                }

                state.step = 'CHOOSE_BANK';
                state.selectedBank = [];
                sendMainMenu();
            }
        });

        socket.on('end', () => userStates.delete(socket));
        socket.on('error', () => userStates.delete(socket));
    });

    const PORT = 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n=> Network Server Active! Listening on port ${PORT}`);
    });
}
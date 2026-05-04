import * as fs from 'fs';
import csv from 'csv-parser';
import * as JSONStream from 'JSONStream';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

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

function logEvent(event: string, data: any = {}) {
    console.log(JSON.stringify({ event, ...data }));
}

function totalJokeCount() {
    filesFinished++;

    if (filesFinished === 2) {
        console.log(`\nTotal jokes Loaded: ${csvJokeCount + jsonJokeCount}`);
        console.log(`CSV jokes loaded: ${csvJokeCount} | JSON jokes Loaded: ${jsonJokeCount}`);
        startServer();
    }
}

// CSV PARSER
fs.createReadStream('jokebank.csv')
    .pipe(csv())
    .on('data', (data: { id: number, joke: string, punchline: string }) => {
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
    .on('data', (data: { id: number, joke: string, punchline: string }) => {
        const newJoke = new Jokes(Number(data.id), data.joke, data.punchline);
        jsonJokes.push(newJoke);
        jsonJokeCount++;
    })
    .on('end', () => {
        console.log('JSON file successfully processed');
        totalJokeCount();
    });

// TCP SERVER
function startServer() {
    const server = net.createServer((socket) => {
        logEvent('CONNECT', { address: socket.remoteAddress });

        userStates.set(socket, { step: 'CHOOSE_BANK' });

        const sendMainMenu = () => {
            const menu =
                '\nCHOOSE WHICH JOKE BANK TO ACCESS\n' +
                '[1] CSV Jokes\n' +
                '[2] JSON Jokes\n' +
                'Enter anything else to exit:\n';

            logEvent('RESPONSE_SENT', { type: 'MENU' });
            socket.write(menu);
        };

        sendMainMenu();

        socket.on('data', (data) => {
            const input = data.toString().trim();
            logEvent('REQUEST_RECEIVED', { input });

            const state = userStates.get(socket);
            if (!state) return;

            if (state.step === 'CHOOSE_BANK') {
                if (input === '1' || input === '2') {
                    state.selectedBank = input === '1' ? csvJokes : jsonJokes;
                    state.step = 'CHOOSE_ID';

                    logEvent('RESPONSE_SENT', {
                        type: 'PROMPT_ID',
                        max: state.selectedBank.length
                    });

                    socket.write(
                        `\nEnter a number from 1 to ${state.selectedBank.length}:\n`
                    );
                } else {
                    logEvent('RESPONSE_SENT', { type: 'EXIT' });
                    socket.write('Goodbye!\n');
                    socket.end();
                }
            } 
            else if (state.step === 'CHOOSE_ID') {
                const chosenId = Number(input);

                if (isNaN(chosenId)) {
                    logEvent('RESPONSE_SENT', {
                        type: 'ERROR',
                        message: 'Invalid input. Please enter a number.'
                    });

                    socket.write('Invalid input. Please enter a number.\n');
                    return;
                }

                const found = state.selectedBank?.find(j => j.id === chosenId);

                if (found) {
                    logEvent('RESPONSE_SENT', {
                        type: 'JOKE_RESPONSE',
                        id: found.id
                    });
                    socket.write(`\n${found.joke}\n${found.punchline}\n`);

                } else {
                    logEvent('RESPONSE_SENT', {
                        type: 'ERROR',
                        message: 'Invalid ID for this bank.'
                    });

                    socket.write('Invalid ID for this bank.\n');
                }

                state.step = 'CHOOSE_BANK';
                delete state.selectedBank;

                sendMainMenu();
            }
        });

        socket.on('end', () => {
            logEvent('DISCONNECT');
            userStates.delete(socket);
        });

        socket.on('error', (err) => {
            logEvent('ERROR', { message: err.message });
            userStates.delete(socket);
        });
    });

    const PORT = Number(process.env.PORT);
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`\n=> Network Server Active! Port: ${PORT}`);
    });
}
import net from 'net';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_IP = process.env.IPADDRESS!;
const PORT = Number(process.env.PORT);

const client = new net.Socket();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.connect(PORT, SERVER_IP, () => {
    console.log('\nConnected to Joke Server');
    console.log('Type EXIT or QUIT to close the connection.');
    console.log('==========================================');
});

client.on('data', (data) => {
    const message = data.toString();
    console.log(message);
});

rl.on('line', (input) => {
    const cleanInput = input.trim().toLowerCase();

    if (cleanInput === 'exit' || cleanInput === 'quit') {
        console.log('Closing connection...');
        client.end();
        return;
    }

    client.write(input.trim() + '\n');
});

client.on('close', () => {
    console.log('\nDisconnected from server.');
    process.exit(0);
});

client.on('error', (err) => {
    console.log('Connection error:', err.message);
});
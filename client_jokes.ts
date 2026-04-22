import net from 'net';
import readline from 'readline';

// --- IMPORTANT CONFIGURATION ---
// If testing on the same computer, '127.0.0.1' works.
// If testing on a DIFFERENT device, change this to local IP (e.g., '192.168.1.15'). (use ipconfig on cmd)
const SERVER_IP = '127.0.0.1'; 
const PORT = 3000;

const client = new net.Socket();

// Connect to the TCP Server
client.connect(PORT, SERVER_IP, () => {
    console.log('Connected to the Joke App!');
});

client.on('data', (data) => {
    process.stdout.write(data.toString()); 
});

client.on('close', () => {
    console.log('\nConnection to server closed.');
    process.exit(0);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    client.write(input.trim());
});
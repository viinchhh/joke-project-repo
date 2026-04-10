import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import JSONStream from 'JSONStream';

export class JokeApp {
    //CSV PARSER METHOD
    public async parseCsvStream(stream: NodeJS.ReadableStream): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            stream
                .pipe(csvParser())
                .on('data', (data) => {
                    const cleanData = {
                        id: data.id ? data.id.trim() : '',
                        joke: data.joke ? data.joke.trim() : '',
                        punchline: data.punchline ? data.punchline.trim() : ''
                    };
                    results.push(cleanData);
                })
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    //JSON PARSER METHOD
    public async parseJsonStream(stream: NodeJS.ReadableStream): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            
            stream
                .pipe(JSONStream.parse('*'))
                .on('data', (data: any) => {
        
                    const cleanData = {
                        id: data.id ? String(data.id).trim() : '',
                        joke: data.joke ? data.joke.trim() : '',
                        punchline: data.punchline ? data.punchline.trim() : ''
                    };
                    results.push(cleanData);
                })
                .on('end', () => resolve(results))
                .on('error', (error: Error) => reject(error));
        });
    }
}

//CSV TESTS
describe('JokeApp - CSV Streams', () => {
    it('should successfully parse a CSV stream', async () => {
        const parser = new JokeApp();

        const mockCsvData = `id,joke,punchline\n1,What is Whitney Houston's favorite type of coordination?,HAAAAAAAAND EYEEEEEEE!!! Coordination.`;
        
        const readableStream = Readable.from([mockCsvData]);

        const jokes = await parser.parseCsvStream(readableStream);

        expect(jokes).toHaveLength(1);
        expect(jokes[0].id).toBe('1');
        
        expect(jokes[0].joke).toBe("What is Whitney Houston's favorite type of coordination?");
    });

    it('should handle and clean unexpected whitespace in the stream data', async() => {
        const parser = new JokeApp();

        const mockMessyCsvData = 'id,joke,punchline\n 2 , Why did the scarecrow win an award? , boolean ';
        const readableStream = Readable.from([mockMessyCsvData]);
        
        const jokes = await parser.parseCsvStream(readableStream);
        
        expect(jokes[0].id).toBe('2');
        expect(jokes[0].joke).toBe('Why did the scarecrow win an award?');
        expect(jokes[0].punchline).toBe('boolean');
    });
});

//JSON TESTS
describe('JokeApp - JSON Streams', () => {
    it('should successfully parse a mocked JSON array stream', async () => {
        const appParser = new JokeApp();

        const mockJsonData = JSON.stringify([
            {
                "id": "3",
                "joke": "Why do programmers prefer dark mode?",
                "punchline": "Because light attracts bugs."
            }
        ]);
        
        const readableStream = Readable.from([mockJsonData]);
        const jokes = await appParser.parseJsonStream(readableStream);

        expect(jokes).toHaveLength(1);
        expect(jokes[0].id).toBe('3');
        expect(jokes[0].joke).toBe('Why do programmers prefer dark mode?');
        expect(jokes[0].punchline).toBe('Because light attracts bugs.');
    });

    it('should handle and clean unexpected whitespace in the JSON data', async () => {
        const appParser = new JokeApp();
        
        const mockMessyJsonData = JSON.stringify([
            {
                "id": " 4 ", 
                "joke": "  What is a ghost's favorite type?  ",
                "punchline": " boolean "
            }
        ]);
        
        const readableStream = Readable.from([mockMessyJsonData]);
        const jokes = await appParser.parseJsonStream(readableStream);

        expect(jokes[0].id).toBe('4');
        expect(jokes[0].joke).toBe("What is a ghost's favorite type?");
        expect(jokes[0].punchline).toBe('boolean');
    });
});
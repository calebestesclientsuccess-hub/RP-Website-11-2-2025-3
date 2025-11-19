import { GoogleGenAI } from '@google/genai';
try {
    const client = new GoogleGenAI({ apiKey: 'test' });
    console.log('client.models keys:', Object.keys(client.models));
    console.log('client.models prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.models)));
} catch (e) {
    console.log('Error:', e);
}

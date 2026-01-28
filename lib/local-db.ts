import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

function getFilePath(collection: string) {
    return path.join(DATA_DIR, `${collection}.json`);
}

function readData(collection: string): any[] {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent ? JSON.parse(fileContent) : [];
}

function writeData(collection: string, data: any[]) {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export class MockModel {
    collection: string;

    constructor(collection: string, schema?: any) {
        this.collection = collection;
    }

    async find(query: any = {}) {
        let data = readData(this.collection);
        // Simple filter support
        if (Object.keys(query).length > 0) {
            data = data.filter(item => {
                for (const key in query) {
                    if (item[key] !== query[key]) return false;
                }
                return true;
            });
        }
        return data;
    }

    async findOne(query: any = {}) {
        const results = await this.find(query);
        return results.length > 0 ? results[0] : null;
    }

    async create(doc: any) {
        const data = readData(this.collection);
        const newDoc = { _id: Math.random().toString(36).substr(2, 9), ...doc, createdAt: new Date() };
        data.push(newDoc);
        writeData(this.collection, data);
        return newDoc;
    }

    async findByIdAndUpdate(id: string, update: any) {
        let data = readData(this.collection);
        const index = data.findIndex(item => item._id === id);
        if (index === -1) return null;

        // Handle $set if present, otherwise assume direct update
        const updates = update.$set ? update.$set : update;

        data[index] = { ...data[index], ...updates };
        writeData(this.collection, data);
        return data[index];
    }

    async findByIdAndDelete(id: string) {
        let data = readData(this.collection);
        const index = data.findIndex(item => item._id === id);
        if (index === -1) return null;

        const deletedItem = data[index];
        data.splice(index, 1);
        writeData(this.collection, data);
        return deletedItem;
    }

    // Mongoose-like static methods
    static async find() { return []; }
}

// Factory to create model instances that mimic Mongoose static & instance methods
export function createMockModel(name: string, schema: any) {
    const modelInstance = new MockModel(name.toLowerCase() + 's', schema);

    // Mixin static methods
    const Model: any = function (doc: any) {
        return {
            ...doc,
            save: async () => modelInstance.create(doc)
        };
    };

    Model.find = (query: any) => modelInstance.find(query);
    Model.findOne = (query: any) => modelInstance.findOne(query);
    Model.create = (doc: any) => modelInstance.create(doc);
    Model.findByIdAndUpdate = (id: string, update: any) => modelInstance.findByIdAndUpdate(id, update);
    Model.findByIdAndDelete = (id: string) => modelInstance.findByIdAndDelete(id);

    return Model;
}

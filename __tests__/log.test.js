const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Log = require('../lib/models/log');
const Recipe = require('../lib/models/recipe');

describe('log routes', () => {
    beforeEach(() => {
        return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
    });

    afterAll(() => {
        return pool.end();
    });

    it('creates a log', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        return request(app)
            .post('/api/v1/logs')
            .send({
                dateOfEvent: '2020-01-01',
                notes: 'it was okay',
                rating: '2',
                recipeId: `${recipes[1].id}`
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: expect.any(String),
                    dateOfEvent: expect.any(String),
                    notes: 'it was okay',
                    rating: 2,
                    recipeId: `${recipes[1].id}`
                });
            });
    });

    it('gets all logs', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        const logs = await Promise.all([
            { dateOfEvent: '2022-11-13', notes: 'note', rating: 3, recipeId: `${recipes[0].id}` },
            { dateOfEvent: '2022-11-13', notes: 'hello', rating: 2, recipeId: `${recipes[1].id}` },
            { dateOfEvent: '2022-11-13', notes: 'bye', rating: 2, recipeId: `${recipes[2].id}` }
        ].map(recipe => Log.insert(recipe)));

        return await request(app)
            .get('/api/v1/logs')
            .then(res => {
                logs.forEach(log => {
                    expect(res.body).toEqual(expect.arrayContaining(logs));
                    expect(res.body).toHaveLength(logs.length);
                });
            });
    });


    it('get an existing log by id', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        const logs = await Promise.all([
            { dateOfEvent: '2022-11-13', notes: 'note', rating: 3, recipeId: `${recipes[0].id}` },
            { dateOfEvent: '2022-11-13', notes: 'hello', rating: 2, recipeId: `${recipes[1].id}` },
            { dateOfEvent: '2022-11-13', notes: 'bye', rating: 2, recipeId: `${recipes[2].id}` }
        ].map(log => Log.insert(log)));


        return request(app)
            .get(`/api/v1/logs/${logs[0].id}`)
            .then(res => {
                expect(res.body).toEqual(logs[0]);
            });
    });

    it('updates a log by id', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        const log = await Log.insert({
            dateOfEvent: '2022-11-13',
            notes: 'note here',
            rating: 4,
            recipeId: `${recipes[0].id}`
        });

        return request(app)
            .put(`/api/v1/logs/${log.id}`)
            .send({
                dateOfEvent: '2022-11-13',
                notes: 'note here',
                rating: 4,
                recipeId: `${recipes[0].id}`
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: expect.any(String),
                    dateOfEvent: expect.any(String),
                    notes: 'note here',
                    rating: 4,
                    recipeId: `${recipes[0].id}`
                });
            });
    });

    it('deletes an existing log by id', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        const logs = await Promise.all([
            { dateOfEvent: '2022-11-13', notes: 'note', rating: 3, recipeId: `${recipes[0].id}` },
            { dateOfEvent: '2022-11-13', notes: 'hello', rating: 2, recipeId: `${recipes[1].id}` },
            { dateOfEvent: '2022-11-13', notes: 'bye', rating: 2, recipeId: `${recipes[0].id}` }
        ].map(log => Log.insert(log)));

        return request(app)
            .delete(`/api/v1/logs/${logs[0].id}`)
            .then(res => {
                expect(res.body).toEqual(logs[0]);
            });
    });
});


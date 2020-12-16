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

        return await request(app)
            .post('/api/v1/logs')
            .send({
                dateOfEvent: '2020-01-01',
                notes: 'it was okay',
                rating: '2',
                recipeId: `${recipes[1].id}`
            })
            .then(res => {
                expect(res.body).toEqual({
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
        const res = await request(app)
            .get('/api/v1/logs');

        expect(res.body).toEqual(expect.arrayContaining(logs));
        expect(res.body).toHaveLength(logs.length);
    });


    it.only('get an existing log by id', async () => {
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
            .get(`/api/v1/logs/1`)
            .then(res => {
                expect(res.body).toEqual(logs[0]);
            });
    });

    it('updates a recipe by id', async () => {
        const recipe = await Recipe.insert({
            name: 'cookies',
            directions: [
                'preheat oven to 375',
                'mix ingredients',
                'put dough on cookie sheet',
                'bake for 10 minutes'
            ],
            ingredients: [
                { 'name': 'flour', 'measurement': 'cup', 'amount': '1' }
            ]
        });

        return request(app)
            .put(`/api/v1/recipes/${recipe.id}`)
            .send({
                name: 'good cookies',
                directions: [
                    'preheat oven to 375',
                    'mix ingredients',
                    'put dough on cookie sheet',
                    'bake for 10 minutes'
                ],
                ingredients: [
                    { 'name': 'flour', 'measurement': 'cup', 'amount': '1' }
                ]
            })
            .then(res => {
                expect(res.body).toEqual({
                    id: expect.any(String),
                    name: 'good cookies',
                    directions: [
                        'preheat oven to 375',
                        'mix ingredients',
                        'put dough on cookie sheet',
                        'bake for 10 minutes'
                    ],
                    ingredients: [
                        { 'name': 'flour', 'measurement': 'cup', 'amount': '1' }
                    ]
                });
            });
    });

    it('deletes an existing recipe by id', async () => {
        const recipes = await Promise.all([
            { name: 'cookies', directions: [], ingredients: [] },
            { name: 'cake', directions: [], ingredients: [] },
            { name: 'pie', directions: [], ingredients: [] }
        ].map(recipe => Recipe.insert(recipe)));

        return request(app)
            .delete(`/api/v1/recipes/${recipes[0].id}`)
            .then(res => {
                expect(res.body).toEqual(recipes[0]);
            });
    });
});


const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  afterAll(() => {
    return pool.end();
  });

  it('creates a recipe', async () => {
    return await request(app)
      .post('/api/v1/recipes')
      .send({
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
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
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
      });
  });

  it('gets all recipes', async () => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [], ingredients: [] },
      { name: 'cake', directions: [], ingredients: [] },
      { name: 'pie', directions: [], ingredients: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toEqual(expect.arrayContaining(recipes));
          expect(res.body).toHaveLength(recipes.length);
        });
      });
  });

  it('get an existing recipe by id', async () => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [], ingredients: [] },
      { name: 'cake', directions: [], ingredients: [] },
      { name: 'pie', directions: [], ingredients: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get(`/api/v1/recipes/${recipes[0].id}`)
      .then(res => {
        expect(res.body).toEqual(recipes[0]);
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



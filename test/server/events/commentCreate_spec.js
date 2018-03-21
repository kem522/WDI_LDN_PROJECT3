/* global api, describe, it, expect, beforeEach */
const Event = require('../../../models/event');
const User = require('../../../models/user');
const jwt = require('jsonwebtoken');
const { secret } = require('../../../config/environment');
//test data
const userData = {
  username: 'test',
  email: 'test@test.com',
  password: 'test',
  passwordConfirmation: 'test'
};

const eventData = {
  'location': {
    'lat': 51.50090949999999,
    'lng': -0.11953229999994619
  },
  'restaurants': [ {
    'id': 'hawksmoor-seven-dials-london-4',
    'name': 'Hawksmoor Seven Dials'
  },
  {
    'id': 'great-queen-street-london',
    'name': 'Great Queen Street'
  },
  {
    'id': 'burger-and-lobster-london-2',
    'name': 'Burger & Lobster'
  },
  {
    'id': 'lanzhou-noodle-bar-london',
    'name': 'Lanzhou Noodle Bar'
  },
  {
    'id': 'quilon-restaurant-london',
    'name': 'Quilon Restaurant'
  }
  ],
  'attendees': [ ],
  'admin': [],
  'name': 'Katsu\'s Event',
  'date': '2018-03-30T23:00:00.000Z',
  'time': '1970-01-01T20:07:00.000Z',
  'comments': [ ],
  'votes': [ ]
};

let token;
let newEvent;
let newUser;

describe('POST /api/events/:id/comments', () => {
  beforeEach(done => {
    Promise.all([
      User.remove({}),
      Event.remove({})
    ])
      .then(() => Event.create(eventData))
      .then(event => newEvent = event)
      .then(() => User.create(userData))
      .then(user => {
        newUser = user;
        token = jwt.sign({ sub: user._id }, secret, { expiresIn: '6h'});
      })
      .then(() => done());
  });

  it('should return a 401 response without a token', done => {
    api
      .post(`/api/events/${newEvent._id}/comments`)
      .end((err,res) => {
        expect(res.status).to.eq(401);
        done();
      });
  });

  it('should return valid event object with the new comment', done => {
    api
      .post(`/api/events/${newEvent._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Testing', user: newUser })
      .end((err, res) => {
        expect(res.body._id).to.be.a('string');
        expect(res.body.name).to.eq(eventData.name);
        expect(res.body.date).to.eq(eventData.date);
        expect(res.body.time).to.eq(eventData.time);
        expect(res.body.location).to.deep.eq(eventData.location);
        expect(res.body.comments[0]._id).to.be.a('string');
        expect(res.body.comments[0].content).to.eq('Testing');
        expect(res.body.comments[0].user.preferences).to.deep.eq(newUser.preferences);
        expect(res.body.comments[0].user._id).to.eq(`${newUser._id}`);
        expect(res.body.comments[0].user.username).to.eq(newUser.username);
        expect(res.body.comments[0].user.email).to.eq(newUser.email);
        expect(res.body.comments[0].user.password).to.eq(newUser.password);
        done();
      });
  });
});

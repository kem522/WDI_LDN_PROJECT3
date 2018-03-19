const Event = require('../models/event');

function createRoute(req,res,next){
  req.body.admin = req.currentUser;
  Event.create(req.body)
    .then(event => res.status(201).json(event))
    .catch(next);
}

function showRoute(req,res,next){
  Event.findById(req.params.id)
    .populate('comments.user attendees votes.voter')
    // .populate('comments.user')
    .then(event => res.json(event))
    .catch(next);
}

function updateRoute(req,res,next){
  Event.findById(req.params.id)
    .then(event => Object.assign(event, req.body))
    .then(event => event.save())
    .then(event => res.json(event))
    .catch(next);
}

function deleteRoute(req,res,next){
  Event.findById(req.params.id)
    .then(event => event.remove())
    .then(() => res.sendStatus(204))
    .catch(next);
}

function voteCreateRoute(req,res,next){
  req.body.voter = req.currentUser;
  Event.findById(req.params.id)
    .then(event => {
      console.log(req.body);
      event.votes.push(req.body);
      console.log(event.votes);
      return event.save();
    })
    .then(event => Event.populate(event, { path: 'comments.user attendees' }))
    .then(event => res.json(event))
    .catch(next);
}

function commentCreateRoute(req,res,next){
  req.body.user = req.currentUser;
  Event.findById(req.params.id)
    .populate('comments.user attendees')
    .then(event => {
      event.comments.push(req.body);
      return event.save();
    })
    .then(event => res.json(event))
    .catch(next);
}

function commentDeleteRoute(req,res,next){
  Event.findById(req.params.id)
    .populate('comments.user attendees')
    .then(event => {
      const comment = event.comments.id(req.params.commentId);
      comment.remove();
      return event.save();
    })
    .then(event => res.json(event))
    .catch(next);
}

function attendeeCreateRoute(req,res,next){
  Event.findById(req.params.id)
    .then(event => {
      event.attendees = event.attendees.concat(req.body);
      return event.save();
    })
    .then(event => Event.populate(event, { path: 'comments.user attendees' }))
    .then(event => res.json(event))
    .catch(next);
}

function attendeeDeleteRoute(req,res,next){
  Event.findById(req.params.id)
    .then(event => {
      event.attendees = event.attendees.filter(attendeeId => !attendeeId.equals(req.params.attendeeId));
      return event.save();
    })
    .then(event => Event.populate(event, { path: 'comments.user attendees' }))
    .then(event => res.json(event))
    .catch(next);
}

module.exports = {
  create: createRoute,
  show: showRoute,
  update: updateRoute,
  delete: deleteRoute,
  voteCreate: voteCreateRoute,
  commentCreate: commentCreateRoute,
  commentDelete: commentDeleteRoute,
  attendeeCreate: attendeeCreateRoute,
  attendeeDelete: attendeeDeleteRoute
};

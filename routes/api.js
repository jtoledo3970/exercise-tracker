const Users      = require('../models/users'),
      Exercises  = require('../models/exercises'),
      router     = require('express').Router();

// New User POST Creation
router.post('/new-user', function(req, res, next) {
  const user = new Users(req.body);
  user.save(function(err, savedUser) {
    if (err) {
      if (err.code == 11000) {
        return next({
          status:  400,
          message: "Username is already taken"
        })
      } else {
        return next(err);
      }
    }
    res.json({username: savedUser.username, _id: savedUser._id});
  });
});

// New Exercise POST Creation
router.post('/add', function(req, res, next) {
  Users.findById(req.body.userId, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next({
        status:  400,
        message: 'Unknown _id'
      })
    }
    const exercise = new Exercises(req.body);
    exercise.username = user.username;
    exercise.save(function(err, savedExercise) {
      if (err) {
        return next(err);
      }
      savedExercise = savedExercise.toObject();
      delete savedExercise.__v
      savedExercise._id = savedExercise.userId;
      delete savedExercise.userId;
      savedExercise.date = (new Date(savedExercise.date)).toDateString();
      res.json(savedExercise);
    })
  });
});

// User GET Function
router.get('/users', function(req, res, next) {
  Users.find({}, function(err, data) {
    res.json({data});
  });
});

router.get('/log', function(req, res, next) {
  const from = new Date(req.query.from);
  const to   = new Date(req.query.to);
  console.log(req.query.userId + ' log userId');
  Users.findById(req.query.userId, function(err, user) {
    if (err) {
      if (!user) {
        return next({
          status:   400,
          message:  'Unknown UserID'
        });
      }
      }
      console.log(user + ' log');
      Exercises.find({
        userId: req.query.userId,
        // date: {
        //   $lt: to != 'Invalid Date' ? to.getTime() : Date.now(),
        //   $gt: from != 'Invalid Date' ? from.getTime() : 0
        // }
      }, {
        __v: 0,
        _id: 0
      }).sort('-date').limit(parseInt(req.query.limit)).exec(function(err, exercises) {
        if (err) {
          return next(err);
        }
        console.log(exercises);
        const out = {
          _id: req.query.userId,
          username: user.username,
          from: from != 'Invalid Date' ? from.toDateString() : undefined,
          to: to != 'Invalid Date' ? to.toDateString() : undefined,
          count: exercises.length,
          log: exercises.map(e => ({
            description: e.description,
            duration:    e.duration,
            date:        e.date.toDateString()
          })
         )
        }
        res.json(out);
      })
  });
});

module.exports = router;
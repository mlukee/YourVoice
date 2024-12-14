var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true,
		validate: {
			validator: function(v) {
				return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(v); 
			}, 
			message: props => 'Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko.' 
		} 
	},
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    bio: { type: String, default: '', },
	avatar: { type: String, default: '/avatars/bear.png'},
    isBanned: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now }
});


UserSchema.statics.authenticate = function(username, password, callback){
	User.findOne({ username: username})
		.exec(function(err, user){
			if(err){
				return callback(err);
			} else if(!user){
				var err = new Error("User not found");
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function(err, result){
				if(result === true){
					return callback(null, user);
				} else{
					return callback();
				}
			});
		});
}

UserSchema.pre('save', function(next) {
	var user = this;

	bcrypt.hash(user.password, SALT_WORK_FACTOR, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

module.exports = mongoose.model('users', UserSchema);
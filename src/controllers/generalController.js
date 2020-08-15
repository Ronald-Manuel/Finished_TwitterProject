'use strict'

const User = require('../models/user.model');
const Tweet = require('../models/tweet.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const authenticated = require('../middlewares/authenticated');


function commands(req, res) {
    let user = new User();
    let tweet = new Tweet();
    let params = req.body;
    let userData = Object.values(params);
    let resp = userData.toString().split(" ");


    switch (resp[0]) {
        case 'register':
            if (resp[1] != null && resp[2] != null && resp[3] != null && resp[4] != null) {
                User.findOne({$or: [{email: resp[2]}, {username: resp[3]}]}, (err, userFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (userFind) {
                        res.send({message: 'El usuario o correo ya está en uso'});
                    } else {
                        user.name = resp[1];
                        user.email = resp[2];
                        user.username = resp[3];
                        user.password = resp[4];

                        bcrypt.hash(resp[4], null, null, (err, hashPassword) => {
                            if (err) {
                                res.status(500).send({message: 'No se pudo encriptar'});
                            } else {
                                user.password = hashPassword;

                                user.save((err, userSaved) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (userSaved) {
                                        res.send({user: userSaved})
                                    } else {
                                        res.status(404).send({message: 'Error al guardar el usuario'});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(404).send({message: 'Porfavor, ingrese todo los datos'});
            }
            break;

        case 'login':
            if (resp[1] != null && resp[2] != null) {
                User.findOne({$or: [{username: resp[1]}, {email: resp[1]}]}, (err, userFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (userFind) {
                        bcrypt.compare(resp[2], userFind.password, (err, checkPassword) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (checkPassword) {
                                if (resp[3] == 'true') {
                                    res.send({token: jwt.createToken(userFind)});
                                } else {
                                    res.send({user: userFind});
                                }
                            } else {
                                res.status(404).send({message: 'Contraseña incorrecta'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'Usuario no encontrado'});
                    }
                });
            } else {
                res.status(404).send({message: 'Porfavor, ingrese el usuario y la contraseña'});
            }
            break;

        case 'add_tweet':
            if (resp[1] != null) {
                tweet.info = resp.join(' ');
                tweet.info = tweet.info.replace('add_tweet', '');
                tweet.info = tweet.info.replace(' ', '');
                tweet.user = authenticated.username;

                if (tweet.info.length <= 280) {
                    User.findByIdAndUpdate(authenticated.idUser, {$inc: {noTweet: 1}}, {new: true}, (err, userUpdate) => {
                        if (err) {
                            res.status(500).send({message: 'Error en el servidor'});
                        } else if (userUpdate) {
                            tweet.save((err, tweetSaved) => {
                                if (err) {
                                    res.status(500).send({message: 'Error en el servidor'});
                                } else if (tweetSaved) {
                                    res.send({tweet: tweetSaved});
                                } else {
                                    res.status(404).send({message: 'Error al guardar el tweet'});
                                }
                            });
                        } else {
                            res.status(404).send({message: 'No se ha podido publicar tu tweet'})
                        }
                    });
                } else {
                    res.status(404).send({message: 'El tweet excede la cantidad máxima de caracteres'});
                }
            } else {
                res.status(404).send({message: 'Ingrese el contenido del tweet'});
            }
            break;

        case 'edit_tweet':
            if (resp[1] != null) {
                if (resp[2] != null) {
                    let info = tweet.info;
                    info = resp.join(' ');
                    info = info.replace('edit_tweet', '');
                    info = info.replace(resp[1], '');
                    info = info.replace('  ', '');

                    if (info.length <= 280) {
                        let update = info;
                        Tweet.findByIdAndUpdate(resp[1], {$set: {info: update }}, {new: true}, (err, tweetUpdated) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (tweetUpdated) {
                                res.send({tweet: tweetUpdated});
                            } else {
                                res.status(404).send({message: 'Error al actualizar el tweet'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'El tweet excede la cantidad máxima de caracteres'});
                    }
                }else{
                    res.status(404).send({message: 'Ingrese la modificación del tweet'});
                }
            }else{
                res.status(404).send({message: 'Ingrese el ID del tweet'});
            }
            break;

        case 'delete_tweet':
            if (resp[1] != null) {
                Tweet.findByIdAndRemove(resp[1], (err, tweetFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (tweetFind) {
                        User.findByIdAndUpdate(authenticated.idUser, {$inc: {noTweet: -1}}, {new: true}, (err, noTweet) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            }else if (noTweet){
                                res.send({message: 'Tweet eliminado'});
                            }else{
                                res.status(404).send({message: 'Error al eliminar los tweets'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'No se ha podido encontrar el tweet'});
                    }
                });
            }else{
                res.status(404).send({message: 'Ingrese el iD del tweet que quiere eliminar'});
            }
            break;

        case 'view_tweets':
            if (resp[1] != null) {
                Tweet.findOne({user: {$regex: resp[1], $options: 'i'}}, (err, tweetsFind) => {
                    if(err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    }else if (tweetsFind) {
                        Tweet.find({user: {$regex: resp[1], $options: 'i'}}, (err, tweets) => {
                            if(err) {
                                res.status(500).send({ message: 'Error en el servidor' });
                            }else if(tweets) {
                                res.send({tweets: tweets});
                            }else{
                                res.status(404).send({ message: 'No se han podido encontrar los tweets'});
                            }
                        }).populate('retweet');
                    }else{
                        res.status(404).send({message: 'El usuario no tiene ningún tweet'});
                    }
                });
            }else{
                res.status(404).send({message: 'Ingrese el usuario para mostrar sus tweets'});
            }
            break;


        case 'follow':
            if (resp[1] != null) {
                if (authenticated.username === resp[1]) {
                    res.status(404).send({message: 'Error, no puedes seguirte a ti mismo'});
                }else{
                    User.findOne({username: resp[1], followers: authenticated.username}, (err, followerFind) => {
                        if(err) {
                            res.status(500).send({message: 'Error en el servidor'});
                        }else if(followerFind) {
                            res.send({message: 'Ya sigues a esta cuenta'});
                        }else{
                            User.findOneAndUpdate({username: resp[1] }, {$push: {followers: authenticated.username}}, {new: true}, (err, followed) => {
                                if(err) {
                                    res.status(500).send({message: 'Error en el servidor'});
                                } else if (followed) {
                                    User.findOneAndUpdate({username: resp[1]}, {$inc: {noFollowers: 1}}, {new: true}, (err, noFollowers) => {
                                        if(err) {
                                            res.status(500).send({message: 'Error en el servidor'});
                                        }else if (noFollowers) {
                                            res.send({message: 'Has comenzado a seguir a ' + resp[1]});
                                        }else{
                                            res.status(404).send({message: 'Error. no ha sido posible aumentar la cantidad de seguidores'});
                                        }
                                    });
                                }else{
                                    res.status(404).send({message: 'No se ha podido seguir al usuario ' + resp[1]});
                                }
                            });
                        }
                    });
                }
            }else{
                res.status(404).send({message: 'Ingresa el usuario que desee seguir'});
            }
            break;

        case 'unfollow':
            if(resp[1] != null) {
                User.findOne({username: resp[1], followers: authenticated.username}, (err, followerFind) => {
                    if(err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    }else if (followerFind) {
                        User.findOneAndUpdate({username: resp[1]}, {$pull: {followers: authenticated.username}}, {new: true}, (err, followed) => {
                            if(err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            }else if(followed) {
                                User.findOneAndUpdate({username: resp[1]}, {$inc: {noFollowers: -1}}, {new: true}, (err, noFollowers) => {
                                    if(err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    }else if(noFollowers) {
                                        res.send({message: 'Ya no sigues a ' + resp[1]});
                                    }else{
                                        res.status(404).send({message: 'Error, no ha sido posible restar la candidad de seguidores'});
                                    }
                                });
                            }else{
                                res.status(404).send({message: 'No se ha podido dejar de seguir al usuario ' + resp[1]});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'No sigues a este usuario'});
                    }
                });
            }else{
                res.status(404).send({message: 'Ingrese el usuario que desee seguir'});
            }
            break;

        case 'profile':
            if (resp[1] != null) {
                User.findOne({username: {$regex: resp[1], $options: 'i'}}, (err, tweets) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (tweets) {
                        User.find({username: resp[1]}, {noFollowers: 1, noTweet: 1, _id: 0, email: 1, name: 1, followers: 1}, (err, userFind) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (userFind) {
                                res.send({message: userFind});
                            } else {
                                res.status(404).send({message: 'No ha sido posible mostrar este perfil'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'No ha sido posible encontrar al usuario'});
                    }
                });
            } else {
                res.status(404).send({message: 'Ingresa el nombre de usuario'});
            }
            break;

        case 'like':
            if (resp[1] != null) {
                Tweet.findById(resp[1], (err, findTweet) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (findTweet) {
                        let user = findTweet.user;
                        User.findOne({username: {$regex: user, $options: 'i'}}, (err, userFind) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (userFind) {
                                let idUser = userFind.id;
                                User.findOne({_id: idUser, followers: authenticated.username}, (err, follower) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (follower) {
                                        Tweet.findOne({_id: resp[1], likes: authenticated.username}, (err, likesFind) => {
                                            if (err) {
                                                res.status(500).send({message: 'Error en el servidor'});
                                            } else if (likesFind) {
                                                res.send({message: 'Este tweet no tiene ningún like tuyo'});
                                            } else {
                                                Tweet.findByIdAndUpdate(resp[1], {$push: {likes: authenticated.username}}, {new: true}, (err, liked) => {
                                                    if (err) {
                                                        res.status(500).send({message: 'Error en el servidor'});
                                                    } else if (liked) {
                                                        Tweet.findByIdAndUpdate(resp[1], {$inc: {numberLikes: 1} }, { new: true }, (err, noLikes) => {
                                                            if (err) {
                                                                res.status(500).send({message: 'Error en el servidor'});
                                                            } else if (noLikes) {
                                                                res.send({message: 'Le has dado like a este tweet'});
                                                            } else {
                                                                res.status(404).send({message: 'No se ha podido sumar el like a este tweet'});
                                                            }
                                                        });
                                                    } else {
                                                        res.status(404).send({message: 'No se ha podido dar like a este tweet'});
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        res.status(404).send({message: 'Debes de seguir a este usuario para dar like a sus tweets'});
                                    }
                                });
                            } else {
                                res.status(404).send({message: 'Usuario no encontrado'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'No se ha encontrado el tweet'});
                    }
                });
            } else {
                res.status(404).send({message: 'Ingrese el ID del tweet al que desee dar like'});
            }
            break;

        case 'dislike':
            if (resp[1] != null) {
                Tweet.findOne({_id: resp[1], likes: authenticated.username}, (err, likesFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (likesFind) {
                        Tweet.findByIdAndUpdate(resp[1], {$pull: {likes: authenticated.username}}, {new: true}, (err, liked) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (liked) {
                                Tweet.findByIdAndUpdate(resp[1], {$inc:{numberLikes: -1}}, {new: true}, (err, noLikes) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (noLikes) {
                                        res.send({message: 'Le has dado dislike a este tweet'});
                                    } else {
                                        res.status(404).send({message: 'No se ha podido restar el dislike de este tweet'});
                                    }
                                });
                            } else {
                                res.status(404).send({message: 'No se ha podido dar dislike a este tweet'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'No le has dado like a este tweet'});
                    }
                });
            } else {
                res.status(404).send({ message: 'Ingrese el ID del tweet al que desee dar dislike'});
            }
            break;

        case 'reply':
            if (resp[1] != null) {
                if (resp[2] != null) {
                    Tweet.comments = resp.join(' ');
                    Tweet.comments = Tweet.comments.replace('reply', '');
                    Tweet.comments = Tweet.comments.replace(resp[1], '');
                    Tweet.comments = Tweet.comments.replace('  ', '');
                    let comment = Tweet.comments;

                    if (Tweet.comments.length <= 280) {
                        Tweet.findByIdAndUpdate(resp[1], {$inc: {numberComments: 1}}, {new: true}, (err, tweetUpdate) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (tweetUpdate) {
                                Tweet.findByIdAndUpdate(resp[1], {$push: {comments: {reply: comment, user: authenticated.username}}}, {new: true}, (err, tweetSaved) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (tweetSaved) {
                                        res.send({tweet: tweetSaved});
                                    } else {
                                        res.status(404).send({message: 'No se ha podido responder el tweet'});
                                    }
                                });
                            } else {
                                res.status(404).send({message: 'No se ha publicado la respuesta al tweet'})
                            }
                        });
                    } else {
                        res.status(404).send({ message: 'La respuesta excede la cantidad máxima de caracteres'});
                    }
                } else {
                    res.status(404).send({message: 'Ingrese lo que desee responder'});
                }
            } else {
                res.status(404).send({message: 'Ingrese el ID del tweet que desee responder'});
            }
            break;

        case 'retweet':
            if (resp[1] != null) {
                tweet.info = resp.join(' ');
                tweet.info = tweet.info.replace('retweet', '');
                tweet.info = tweet.info.replace(resp[1], '');
                tweet.info = tweet.info.replace('  ', '');
                let info = tweet.info;


                tweet.save((err, tweetFind) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor'});
                    } else if (tweetFind) {
                        let idTweet = tweetFind.id;
                        User.findByIdAndUpdate(authenticated.idUser, {$inc: {noTweet: 1}}, {new: true}, (err, noTweet) => {
                            if (err) {
                                res.status(500).send({message: 'Error en el servidor'});
                            } else if (noTweet) {
                                Tweet.findByIdAndUpdate(resp[1], {$inc: {numberRetweets: 1}}, {new: true}, (err, noRetweet) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor'});
                                    } else if (noRetweet) {
                                        Tweet.findByIdAndUpdate(idTweet, {$set: {info: info, retweet: resp[1], user: authenticated.username}}, {new: true}, (err, retweet) => {
                                            if (err) {
                                                res.status(500).send({message: 'Error en el servidor'});
                                            } else if (retweet) {
                                                res.send({tweet: retweet});
                                            } else {
                                                res.send({message: 'No ha sido posible retwittear'});
                                            }
                                        }).populate('retweet');
                                    } else {
                                        res.status(404).send({message: 'No se ha podido sumar el retweet al contador'});
                                    }
                                });
                            } else {
                                res.status(404).send({message: 'Error al sumar el retweet'});
                            }
                        });
                    } else {
                        res.status(404).send({message: 'No ha sido posible retwittear'});
                    }
                });
            } else {
                res.status(404).send({message: 'Ingrese el ID del tweet que desee retwittear'});
            }
            break;

        default:
            res.status(404).send({message: 'Porfavor, ingrese el comando correcto'});
            break;
    }
}


module.exports = {
    commands
}
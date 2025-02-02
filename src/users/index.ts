import { Request, Response, Router } from 'express';
import bodyParser from 'body-parser';
import { User, validateFullUser, validateUser } from './user';
import getUserService from '../services/users-service';
import { handleError } from '../utils/errors';
import authMiddleware from '../auth/auth-middleware';

function cleanUser({password, ...user}: User) {
    return user;
}

async function getAllUsers(req: Request, res: Response) {

    const users = await getUserService().all();
    res.send(users.map(cleanUser));
}

async function getUserById(req: Request, res: Response) {
    // read if from URL (param)
    const id = req.params.id;
    const user = await getUserService().one(id);
    res.send(cleanUser(user));
}

async function createUser(req: Request, res: Response) {
    try {
        const user = validateUser(req.body);
        const savedUser = await getUserService().save(user);
        res.send(savedUser);
    } catch (e) {
        handleError(res, e.message);
    }
}

async function updateUser(req: Request, res: Response) {
    try {
        const user = validateFullUser(req.body);
        const updatedUser = await getUserService().update(user);
        res.send(updatedUser);
    } catch (e) {
        handleError(res, e.message);
    }
}

async function removeUser(req: Request, res: Response) {
    const id = req.params.id;
    console.log(`user email: ${res.locals.email} deleted user id: ${id}`);
    await getUserService().remove(id);
    res.send({id});
}


// CRUD feature (Create, Read, Update, Delete)
const users = Router();

users.use(authMiddleware);

users.get('/', getAllUsers);
users.get('/:id', getUserById);
users.post('/', bodyParser.json(), createUser);
users.put('/', bodyParser.json(), updateUser);
users.delete('/:id', removeUser);


export default users;





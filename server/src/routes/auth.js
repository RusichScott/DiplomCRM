const bcrypt = require('bcrypt');
const prisma  = require('../db');

async function authRoutes(fastify) {

    fastify.post('/register', async (request, reply) => {
        const { first_name, last_name, email, password, phone } = request.body || {};

        if (!first_name || !last_name || !email || !password) {
            return reply.status(400).send({ error: 'Заполните все обязательные поля' });
        }

        const existing = await prisma.users.findUnique({ where: { email } });
        if (existing) {
            return reply.status(409).send({ error: 'Пользователь с таким email уже существует' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: { first_name, last_name, email, password_hash, phone: phone || null }
        });

        const token = fastify.jwt.sign({ id: user.id, email: user.email });

        return reply.status(201).send({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    });

    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body || {};

        if (!email || !password) {
            return reply.status(400).send({ error: 'Введите email и пароль' });
        }

        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            return reply.status(401).send({ error: 'Неверный email или пароль' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return reply.status(401).send({ error: 'Неверный email или пароль' });
        }

        const token = fastify.jwt.sign({ id: user.id, email: user.email });

        return reply.send({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        });
    });
}

module.exports = authRoutes;

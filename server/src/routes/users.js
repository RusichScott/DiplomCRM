const bcrypt = require('bcrypt');
const prisma  = require('../db');

const SELECT_ME = {
    id: true, first_name: true, last_name: true,
    email: true, phone: true, birthday: true, created_at: true
};

async function userRoutes(fastify) {

    // GET /users/me
    fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = await prisma.users.findUnique({
            where:  { id: request.user.id },
            select: { ...SELECT_ME, addresses: true }
        });
        if (!user) return reply.status(404).send({ error: 'Пользователь не найден' });
        return reply.send(user);
    });

    // PUT /users/me — обновить профиль
    fastify.put('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { first_name, last_name, phone, birthday } = request.body || {};
        const data = {};
        if (first_name)          data.first_name = first_name;
        if (last_name)           data.last_name  = last_name;
        if (phone !== undefined) data.phone      = phone || null;
        if (birthday)            data.birthday   = new Date(birthday);

        const user = await prisma.users.update({
            where:  { id: request.user.id },
            data,
            select: SELECT_ME
        });
        return reply.send(user);
    });

    // PUT /users/me/password — сменить пароль
    fastify.put('/me/password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { current_password, new_password } = request.body || {};

        if (!current_password || !new_password) {
            return reply.status(400).send({ error: 'Заполните все поля' });
        }
        if (new_password.length < 6) {
            return reply.status(400).send({ error: 'Пароль должен быть не менее 6 символов' });
        }

        const user  = await prisma.users.findUnique({ where: { id: request.user.id } });
        const valid = await bcrypt.compare(current_password, user.password_hash);
        if (!valid) return reply.status(401).send({ error: 'Неверный текущий пароль' });

        const password_hash = await bcrypt.hash(new_password, 10);
        await prisma.users.update({ where: { id: request.user.id }, data: { password_hash } });

        return reply.send({ ok: true });
    });
}

module.exports = userRoutes;

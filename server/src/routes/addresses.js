const prisma = require('../db');

async function addressRoutes(fastify) {

    // GET /addresses
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const addresses = await prisma.addresses.findMany({
            where:   { user_id: request.user.id },
            orderBy: [{ is_default: 'desc' }, { id: 'asc' }]
        });
        return reply.send(addresses);
    });

    // POST /addresses — добавить адрес
    fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { title, full_name, city, street, postal_code, phone, is_default } = request.body || {};

        if (!full_name || !city || !street) {
            return reply.status(400).send({ error: 'Укажите имя получателя, город и улицу' });
        }

        // Если новый адрес помечается основным — сбрасываем флаг у остальных
        if (is_default) {
            await prisma.addresses.updateMany({
                where: { user_id: request.user.id },
                data:  { is_default: false }
            });
        }

        const address = await prisma.addresses.create({
            data: {
                user_id:     request.user.id,
                title:       title?.trim() || 'Адрес',
                full_name:   full_name.trim(),
                city:        city.trim(),
                street:      street.trim(),
                postal_code: postal_code?.trim() || null,
                phone:       phone?.trim() || null,
                is_default:  Boolean(is_default)
            }
        });

        return reply.status(201).send(address);
    });

    // DELETE /addresses/:id — удалить адрес
    fastify.delete('/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        await prisma.addresses.deleteMany({
            where: { id: Number(request.params.id), user_id: request.user.id }
        });
        return reply.send({ ok: true });
    });
}

module.exports = addressRoutes;

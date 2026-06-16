const prisma = require('../db');

async function wishlistRoutes(fastify) {

    // GET /wishlist
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const items = await prisma.wishlist.findMany({
            where:   { user_id: request.user.id },
            include: { products: { include: { product_images: true } } },
            orderBy: { added_at: 'desc' }
        });
        return reply.send(items);
    });

    // POST /wishlist  { product_id }
    fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { product_id } = request.body || {};
        if (!product_id) return reply.status(400).send({ error: 'product_id обязателен' });

        try {
            const item = await prisma.wishlist.create({
                data: { user_id: request.user.id, product_id: Number(product_id) }
            });
            return reply.status(201).send(item);
        } catch {
            return reply.status(409).send({ error: 'Уже в избранном' });
        }
    });

    // DELETE /wishlist/:productId
    fastify.delete('/:productId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const product_id = Number(request.params.productId);
        await prisma.wishlist.deleteMany({
            where: { user_id: request.user.id, product_id }
        });
        return reply.send({ ok: true });
    });
}

module.exports = wishlistRoutes;

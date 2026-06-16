const prisma = require('../db');

async function cartRoutes(fastify) {

    // GET /cart
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const items = await prisma.cart_items.findMany({
            where:   { user_id: request.user.id },
            include: { products: { include: { product_images: true } } },
            orderBy: { added_at: 'desc' }
        });
        return reply.send(items);
    });

    // POST /cart  { product_id, quantity? }
    fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { product_id, quantity = 1 } = request.body || {};
        if (!product_id) return reply.status(400).send({ error: 'product_id обязателен' });

        const product = await prisma.products.findUnique({ where: { id: Number(product_id) } });
        if (!product || !product.is_active) return reply.status(404).send({ error: 'Товар не найден' });

        const item = await prisma.cart_items.upsert({
            where: {
                user_id_product_id: { user_id: request.user.id, product_id: Number(product_id) }
            },
            create: { user_id: request.user.id, product_id: Number(product_id), quantity: Number(quantity) },
            update: { quantity: { increment: Number(quantity) } }
        });

        return reply.status(201).send(item);
    });

    // DELETE /cart/:productId
    fastify.delete('/:productId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const product_id = Number(request.params.productId);
        await prisma.cart_items.deleteMany({
            where: { user_id: request.user.id, product_id }
        });
        return reply.send({ ok: true });
    });
}

module.exports = cartRoutes;

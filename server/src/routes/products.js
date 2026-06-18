const prisma = require('../db');

async function productRoutes(fastify) {

    // GET /products?category=slug&limit=N — для сайта (только активные)
    fastify.get('/', async (request, reply) => {
        const { category, limit, is_new } = request.query;
        const where = { is_active: true };
        if (category) where.categories = { slug: category };
        if (is_new === 'true') where.is_new = true;

        const products = await prisma.products.findMany({
            where,
            include: {
                categories:     { select: { name: true, slug: true } },
                product_images: true
            },
            orderBy: [{ is_new: 'desc' }, { created_at: 'desc' }],
            ...(limit ? { take: Number(limit) } : {})
        });
        return reply.send(products);
    });

    // GET /products/categories — список категорий для фильтра в CRM
    fastify.get('/categories', async (request, reply) => {
        const categories = await prisma.categories.findMany({
            orderBy: { sort_order: 'asc' }
        });
        return reply.send(categories);
    });

    // GET /products/crm — все товары включая неактивные для CRM
    fastify.get('/crm', async (request, reply) => {
        const products = await prisma.products.findMany({
            include: {
                categories:     { select: { id: true, name: true, slug: true } },
                product_images: { select: { image_url: true, is_primary: true } }
            },
            orderBy: [{ category_id: 'asc' }, { name: 'asc' }]
        });
        return reply.send(products);
    });

    // POST /products — создать товар
    fastify.post('/', async (request, reply) => {
        const { name, category_id, price, old_price, description, sku, stock, is_new, is_active } = request.body || {};

        if (!name || !category_id || price == null || !sku) {
            return reply.status(400).send({ error: 'Обязательные поля: name, category_id, price, sku' });
        }

        try {
            const product = await prisma.products.create({
                data: {
                    name,
                    category_id: Number(category_id),
                    price:       Number(price),
                    old_price:   old_price != null && old_price !== '' ? Number(old_price) : null,
                    description: description || null,
                    sku,
                    stock:     Number(stock ?? 0),
                    is_new:    Boolean(is_new),
                    is_active: is_active !== false
                },
                select: { id: true }
            });
            return reply.status(201).send({ id: product.id });
        } catch (err) {
            if (err.code === 'P2002') {
                return reply.status(409).send({ error: 'Артикул уже занят' });
            }
            throw err;
        }
    });

    // PATCH /products/:id — обновить товар
    fastify.patch('/:id', async (request, reply) => {
        const id = Number(request.params.id);
        if (!Number.isFinite(id)) return reply.status(400).send({ error: 'Неверный ID' });

        const { name, category_id, price, old_price, description, sku, stock, is_new, is_active } = request.body || {};

        const data = {};
        if (name        !== undefined) data.name        = name;
        if (category_id !== undefined) data.category_id = Number(category_id);
        if (price       !== undefined) data.price       = Number(price);
        if (old_price   !== undefined) data.old_price   = old_price != null && old_price !== '' ? Number(old_price) : null;
        if (description !== undefined) data.description = description || null;
        if (sku         !== undefined) data.sku         = sku;
        if (stock       !== undefined) data.stock       = Number(stock);
        if (is_new      !== undefined) data.is_new      = Boolean(is_new);
        if (is_active   !== undefined) data.is_active   = Boolean(is_active);

        try {
            const product = await prisma.products.update({
                where:  { id },
                data,
                select: { id: true }
            });
            return reply.send({ id: product.id });
        } catch (err) {
            if (err.code === 'P2002') {
                return reply.status(409).send({ error: 'Артикул уже занят' });
            }
            throw err;
        }
    });

    // DELETE /products/:id — удалить товар
    fastify.delete('/:id', async (request, reply) => {
        const id = Number(request.params.id);
        if (!Number.isFinite(id)) return reply.status(400).send({ error: 'Неверный ID' });

        try {
            await prisma.products.delete({ where: { id } });
            return reply.send({ success: true });
        } catch (err) {
            if (err.code === 'P2003') {
                return reply.status(409).send({ error: 'Нельзя удалить товар, который есть в заказах' });
            }
            throw err;
        }
    });
}

module.exports = productRoutes;

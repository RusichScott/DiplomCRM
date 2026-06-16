const prisma = require('../db');

async function orderRoutes(fastify) {

    // GET /orders — все заказы для CRM (без авторизации, т.к. CRM-токен ещё не реализован)
    fastify.get('/', async (request, reply) => {
        const orders = await prisma.orders.findMany({
            include: {
                users: {
                    select: { id: true, first_name: true, last_name: true, email: true, phone: true }
                },
                order_items: true,
                addresses:   true
            },
            orderBy: { created_at: 'desc' }
        });
        return reply.send(orders);
    });

    // GET /orders/analytics?period=day|week|month|year
    fastify.get('/analytics', async (request, reply) => {
        const { period = 'month' } = request.query

        const now   = new Date()
        const start = new Date(now)
        if      (period === 'day')  start.setDate(now.getDate() - 1)
        else if (period === 'week') start.setDate(now.getDate() - 7)
        else if (period === 'year') start.setFullYear(now.getFullYear() - 1)
        else                        start.setMonth(now.getMonth() - 1)

        const [totals, topProducts] = await Promise.all([
            prisma.orders.aggregate({
                _sum:   { total_amount: true },
                _count: { id: true },
                _avg:   { total_amount: true },
                where:  { created_at: { gte: start }, status: { not: 'cancelled' } }
            }),
            prisma.$queryRaw`
                SELECT c.name AS name,
                       SUM(oi.quantity)::int AS qty,
                       SUM(oi.price * oi.quantity) AS revenue
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                JOIN products p ON p.id = oi.product_id
                JOIN categories c ON c.id = p.category_id
                WHERE o.created_at >= ${start}
                  AND o.status != 'cancelled'
                GROUP BY c.id, c.name
                ORDER BY qty DESC
            `
        ])

        return reply.send({
            totalRevenue: Number(totals._sum.total_amount ?? 0),
            totalOrders:  totals._count.id,
            avgOrder:     Math.round(Number(totals._avg.total_amount ?? 0)),
            topProducts: topProducts.map(p => ({
                name:    p.name,
                qty:     Number(p.qty),
                revenue: Number(p.revenue ?? 0)
            }))
        })
    })

    // GET /orders/my — заказы текущего пользователя
    fastify.get('/my', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const orders = await prisma.orders.findMany({
            where:   { user_id: request.user.id },
            include: { order_items: true, addresses: true },
            orderBy: { created_at: 'desc' }
        });
        return reply.send(orders);
    });

    // POST /orders — создать заказ из корзины
    fastify.post('/', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { address_id, comment } = request.body || {};

        const cartItems = await prisma.cart_items.findMany({
            where:   { user_id: request.user.id },
            include: { products: true }
        });

        if (!cartItems.length) {
            return reply.status(400).send({ error: 'Корзина пуста' });
        }

        const total_amount = cartItems.reduce(
            (sum, item) => sum + Number(item.products.price) * item.quantity, 0
        );

        const order = await prisma.orders.create({
            data: {
                user_id:    request.user.id,
                address_id: address_id ? Number(address_id) : null,
                status:     'pending',
                total_amount,
                comment:    comment || null,
                order_items: {
                    create: cartItems.map(item => ({
                        product_id:   item.product_id,
                        product_name: item.products.name,
                        price:        item.products.price,
                        quantity:     item.quantity
                    }))
                }
            },
            include: { order_items: true }
        });

        await prisma.cart_items.deleteMany({ where: { user_id: request.user.id } });

        return reply.status(201).send(order);
    });

    // PATCH /orders/:id/status — изменить статус (CRM)
    fastify.patch('/:id/status', async (request, reply) => {
        const { status } = request.body || {};
        const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!valid.includes(status)) {
            return reply.status(400).send({ error: 'Неверный статус' });
        }

        const id = Number(request.params.id);
        if (!Number.isFinite(id)) {
            return reply.status(400).send({ error: 'Неверный ID заказа' });
        }

        const order = await prisma.orders.update({
            where: { id },
            data:  { status }
        });

        // Real-time: уведомляем всех подключённых клиентов
        try {
            fastify.io.emit('order:updated', {
                orderId: order.id,
                userId:  order.user_id,
                status
            });
        } catch (e) {
            fastify.log.warn(e, 'socket.io emit failed');
        }

        // Возвращаем только примитивные поля, чтобы избежать проблем
        // с сериализацией Prisma Decimal (total_amount, delivery_cost и т.д.)
        return reply.send({ id: order.id, status });
    });
}

module.exports = orderRoutes;

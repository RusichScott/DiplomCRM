const prisma = require('../db');

async function customerRoutes(fastify) {

    // GET /customers
    fastify.get('/', async (request, reply) => {
        const users = await prisma.users.findMany({
            select: {
                id:         true,
                first_name: true,
                last_name:  true,
                email:      true,
                phone:      true,
                created_at: true,
                orders: {
                    select: {
                        total_amount: true,
                        status:       true,
                        created_at:   true
                    },
                    orderBy: { created_at: 'desc' }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return reply.send(
            users.map(u => ({
                id:          u.id,
                first_name:  u.first_name,
                last_name:   u.last_name,
                email:       u.email,
                phone:       u.phone,
                created_at:  u.created_at,
                order_count: u.orders.length,
                total_spent: u.orders.reduce((s, o) => s + Number(o.total_amount), 0),
                last_order:  u.orders[0] ?? null
            }))
        );
    });
}

module.exports = customerRoutes;

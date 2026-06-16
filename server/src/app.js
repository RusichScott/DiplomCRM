require('dotenv').config();
const fastify      = require('fastify')({ logger: true });
const { Server }   = require('socket.io');

const ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'null'
];

fastify.register(require('@fastify/cors'), {
    origin:      ALLOWED_ORIGINS,
    credentials: true,
    methods:     ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
});

// Socket.io — подключается к тому же HTTP-серверу что и Fastify
const io = new Server(fastify.server, {
    cors: {
        origin:      ALLOWED_ORIGINS,
        credentials: true
    }
});
fastify.decorate('io', io);

fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'miestilo_secret_key_2026'
});

fastify.decorate('authenticate', async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
    }
});

fastify.register(require('./routes/auth'),      { prefix: '/auth' });
fastify.register(require('./routes/users'),     { prefix: '/users' });
fastify.register(require('./routes/orders'),    { prefix: '/orders' });
fastify.register(require('./routes/customers'), { prefix: '/customers' });
fastify.register(require('./routes/products'),  { prefix: '/products' });
fastify.register(require('./routes/cart'),      { prefix: '/cart' });
fastify.register(require('./routes/wishlist'),  { prefix: '/wishlist' });
fastify.register(require('./routes/addresses'), { prefix: '/addresses' });

const start = async () => {
    try {
        await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '127.0.0.1' });
        console.log('Server running at http://127.0.0.1:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

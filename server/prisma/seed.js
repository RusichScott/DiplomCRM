const prisma = require('../src/db');

async function main() {
    console.log('Seeding categories...');

    const [koltsa, sergi, kaffy, braslety, kole, uhod] = await Promise.all([
        prisma.categories.upsert({ where: { slug: 'koltsa'   }, create: { name: 'Кольца',            slug: 'koltsa',   sort_order: 1 }, update: {} }),
        prisma.categories.upsert({ where: { slug: 'sergi'    }, create: { name: 'Серьги',             slug: 'sergi',    sort_order: 2 }, update: {} }),
        prisma.categories.upsert({ where: { slug: 'kaffy'    }, create: { name: 'Каффы',              slug: 'kaffy',    sort_order: 3 }, update: {} }),
        prisma.categories.upsert({ where: { slug: 'braslety' }, create: { name: 'Браслеты',           slug: 'braslety', sort_order: 4 }, update: {} }),
        prisma.categories.upsert({ where: { slug: 'kole'     }, create: { name: 'Колье',              slug: 'kole',     sort_order: 5 }, update: {} }),
        prisma.categories.upsert({ where: { slug: 'uhod'     }, create: { name: 'Уход и хранение',   slug: 'uhod',     sort_order: 6 }, update: {} }),
    ]);

    console.log('Seeding products...');

    const products = [
        // Кольца
        { sku: 'RNG-001', category_id: koltsa.id,   name: 'Серебряное кольцо EROS с натуральным гранатом',    price: 14299, stock: 15, is_new: true,  description: 'Инкрустировано натуральным гранатом насыщенного красного цвета. Серебро 925 пробы.' },
        { sku: 'RNG-002', category_id: koltsa.id,   name: 'Серебряное кольцо LUNA с лунным камнем',           price: 11500, stock: 20, is_new: false, description: 'Нежный лунный камень с перламутровым сиянием в изящной оправе из серебра 925 пробы.' },
        { sku: 'RNG-003', category_id: koltsa.id,   name: 'Кольцо MAYA P из серебра с фианитами',             price:  8900, stock: 30, is_new: false, description: 'Классический дизайн с дорожкой из фианитов. Универсальный размер.' },
        { sku: 'RNG-004', category_id: koltsa.id,   name: 'Кольцо-печатка ORBIT из серебра',                  price:  9600, stock: 12, is_new: false, description: 'Массивная печатка из серебра 925 пробы с матовой гравировкой.', old_price: 11800 },
        { sku: 'RNG-005', category_id: koltsa.id,   name: 'Двойное кольцо AURORA с цирконием',               price: 12200, stock: 18, is_new: false, description: 'Двойная конструкция с россыпью кубических цирконов. Серебро 925 пробы.' },

        // Серьги
        { sku: 'ERG-001', category_id: sergi.id,    name: 'Серебряные серьги-клаймберы EROS с фианитами',     price:  8599, stock: 40, is_new: true,  description: 'Клаймберы оплетают ухо и создают эффект множества серёжек. Серебро 925 пробы.' },
        { sku: 'ERG-002', category_id: sergi.id,    name: 'Серьги-гвоздики LUNA с натуральным жемчугом',      price:  5200, stock: 50, is_new: false, description: 'Классические гвоздики с натуральным пресноводным жемчугом 7–8 мм.' },
        { sku: 'ERG-003', category_id: sergi.id,    name: 'Серьги-капли MAYA с лунным камнем',                price:  9800, stock: 22, is_new: false, description: 'Удлинённые подвески с крупным кабошоном из лунного камня.' },
        { sku: 'ERG-004', category_id: sergi.id,    name: 'Серьги-кольца ORBIT из серебра',                   price:  6400, stock: 35, is_new: false, description: 'Классические кольца-хупы с гладкой поверхностью. Диаметр 25 мм.' },
        { sku: 'ERG-005', category_id: sergi.id,    name: 'Серьги AURORA с горным хрусталём',                 price: 11000, stock: 18, is_new: false, description: 'Объёмные серьги с природным горным хрусталём. Серебро 925 пробы.', old_price: 13500 },

        // Каффы
        { sku: 'KFF-001', category_id: kaffy.id,    name: 'Серебряный кафф EROS с натуральными гранатами',    price: 12899, stock: 12, is_new: false, description: 'Кафф без прокола с гранатами огненно-красного цвета. Серебро 925 пробы.' },
        { sku: 'KFF-002', category_id: kaffy.id,    name: 'Кафф LUNA с лунным камнем',                        price: 10200, stock: 20, is_new: true,  description: 'Нежный кафф без прокола с мерцающим лунным камнем. Серебро 925 пробы.' },
        { sku: 'KFF-003', category_id: kaffy.id,    name: 'Кафф-змея SERPENT из серебра 925 пробы',           price: 14500, stock:  8, is_new: false, description: 'Дизайн в виде изгибающейся змеи с миниатюрными кристаллами.' },
        { sku: 'KFF-004', category_id: kaffy.id,    name: 'Двойной кафф ORBIT с цирконием',                   price:  8700, stock: 25, is_new: false, description: 'Двойной кафф охватывает ухо в двух местах. Цирконы белого цвета.' },

        // Браслеты
        { sku: 'BRS-001', category_id: braslety.id, name: 'Браслет-цепочка EROS из серебра',                  price:  9999, stock: 30, is_new: false, description: 'Изящная цепочка с карабиновой застёжкой. Серебро 925 пробы, длина 18 см.' },
        { sku: 'BRS-002', category_id: braslety.id, name: 'Браслет LUNA с натуральными гранатами',            price: 13500, stock: 15, is_new: false, description: 'Серебряный браслет с чередующимися гранатами и фианитами.' },
        { sku: 'BRS-003', category_id: braslety.id, name: 'Жёсткий браслет ORBIT из серебра',                 price: 15800, stock: 10, is_new: false, description: 'Жёсткий металлический браслет с матово-полированной поверхностью.', old_price: 19000 },
        { sku: 'BRS-004', category_id: braslety.id, name: 'Браслет с подвесками CHARM',                       price:  8400, stock: 22, is_new: true,  description: 'Цепочечный браслет с пятью тематическими подвесками. Серебро 925 пробы.' },
        { sku: 'BRS-005', category_id: braslety.id, name: 'Теннисный браслет MAYA с фианитами',               price: 11200, stock: 16, is_new: false, description: 'Классический теннисный браслет с дорожкой из кубических фианитов.' },

        // Колье
        { sku: 'KOL-001', category_id: kole.id,     name: 'Жёсткое колье MAYA P с горным хрусталём',         price: 45499, stock:  5, is_new: false, description: 'Роскошное жёсткое колье с крупными кристаллами горного хрусталя. Серебро 925 пробы.' },
        { sku: 'KOL-002', category_id: kole.id,     name: 'Колье-чокер LUNA с натуральным жемчугом',         price: 18000, stock: 12, is_new: false, description: 'Бархатный чокер с подвеской из натурального жемчуга. Замок из серебра 925 пробы.' },
        { sku: 'KOL-003', category_id: kole.id,     name: 'Колье-цепочка EROS из серебра 925 пробы',         price: 12300, stock: 28, is_new: false, description: 'Тонкая цепочка с подвеской в виде сердца с гранатом. Длина 45 см.' },
        { sku: 'KOL-004', category_id: kole.id,     name: 'Многослойное колье ORBIT с подвесками',           price: 22500, stock:  8, is_new: true,  description: 'Три цепочки разной длины с геометрическими подвесками. Серебро 925 пробы.' },

        // Уход
        { sku: 'UHD-001', category_id: uhod.id,     name: 'Набор для чистки серебряных украшений CLEAN',     price:  1200, stock:100, is_new: false, description: 'Набор включает специальный раствор, щёточку и полировальную салфетку.' },
        { sku: 'UHD-002', category_id: uhod.id,     name: 'Шкатулка для украшений VELVET',                   price:  2800, stock: 30, is_new: false, description: 'Шкатулка из МДФ с бархатной обивкой. 12 отделений для украшений.' },
        { sku: 'UHD-003', category_id: uhod.id,     name: 'Полироль для ювелирных изделий SHINE',            price:   900, stock: 80, is_new: false, description: 'Специальная паста для финальной полировки серебряных и золотых украшений.' },
        { sku: 'UHD-004', category_id: uhod.id,     name: 'Антицарапающая ткань для полировки украшений',   price:   450, stock:120, is_new: false, description: 'Микрофибровая ткань для бережной полировки украшений без царапин.' },
    ];

    for (const p of products) {
        await prisma.products.upsert({
            where:  { sku: p.sku },
            create: p,
            update: { name: p.name, price: p.price, stock: p.stock, is_new: p.is_new, description: p.description, old_price: p.old_price ?? null }
        });
    }

    console.log(`Done: ${products.length} products seeded across 6 categories.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

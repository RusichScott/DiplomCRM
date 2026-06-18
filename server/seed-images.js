require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const images = [
    // Кольца
    { product_id: 1,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/e3a/686_820_2/1gqzw4zsnpjc619goy3p591wwc4bvz2t.webp' }, // EROS с гранатом → крупное кольцо
    { product_id: 2,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/b80/686_820_2/taf933hyvbus0xfst5dogzvqz1w53j9u.webp' }, // LUNA с лунным камнем
    { product_id: 3,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/f57/686_820_2/2x2v22bi0m88sr6zxmthlhdp137bmtti.webp' }, // MAYA P с фианитами → дорожка фианитов
    { product_id: 4,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/169/686_820_2/zljibs2zt1sefl115udbkqn1oaq5nn2c.webp' }, // ORBIT печатка → объёмное кольцо
    { product_id: 5,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/264/686_820_2/fwgxsthv214tfkjcfv04h32uurhoet8n.webp' }, // AURORA двойное → многослойное с фианитами
    // Серьги
    { product_id: 6,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/5b4/686_820_2/k8tlnybmuanomffyr4h0jwq5vn62gikn.webp' }, // клаймберы EROS → клаймберы с фианитом
    { product_id: 7,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/ea5/686_820_2/mwc7qznq592q76zbw5p74jni12nff8vt.webp' }, // LUNA гвоздики с жемчугом → серьги с жемчугом
    { product_id: 8,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/bb0/686_820_2/t7d5lyadotqllap7669hxg7uwo2wg5x4.webp' }, // MAYA капли с лунным камнем → капли
    { product_id: 9,  image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/4c5/686_820_2/rcz6wcwze3ewn04vrilf650o5hkdtp5r.webp' }, // ORBIT кольца-хупы → серьги-кольца
    { product_id: 10, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/0e8/686_820_2/o6bvccqs302d26ygdzg1m81fzbeafyeo.webp' }, // AURORA с хрусталём → крупные с камнем
    // Каффы
    { product_id: 11, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/5f5/686_820_2/3s4lfp1qn57zv0p5n311h1gduldebgqn.webp' }, // EROS с гранатами → кафф Эрос с гранатами (точное совпадение)
    { product_id: 12, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/fa9/686_820_2/ddxjfbafl6rmttpv706knyobjhfhvf4z.webp' }, // LUNA с лунным камнем → кафф с жемчугом
    { product_id: 13, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/bfd/686_820_2/8zmeg6w5undake7w8wk2pyvc45xsm3e3.webp' }, // SERPENT змея → крупный кафф
    { product_id: 14, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/720/686_820_2/qn4dec94ym70xcdnzokoesaob2zyhqka.webp' }, // ORBIT двойной с цирконием → кафф с белыми камнями
    // Браслеты
    { product_id: 15, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/bbc/686_820_2/ssog7dhnwgnm9xd4z2x8v2sjcrqddda3.webp' }, // EROS цепочка → браслет цепочка
    { product_id: 16, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/af2/686_820_2/45evwveqjl6vpm6t5mxf3aerwbpyn2hv.webp' }, // LUNA с гранатами → браслет с камнями
    { product_id: 17, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/4cf/686_820_2/cq7smilgoduwzp3kheup0nz20lp8jh66.webp' }, // ORBIT жёсткий → жёсткий браслет Майя П
    { product_id: 18, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/eee/686_820_2/qtb0rpe3vyxikmf2ctrjsiz3nxf6k9ym.webp' }, // CHARM с подвесками → слейв-браслет Кристалл
    { product_id: 19, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/cd5/686_820_2/r17r6k7qf4jhmg2oj61cmkgkot9la370.webp' }, // MAYA теннисный с фианитами → теннисный Симона
    // Колье
    { product_id: 20, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/8f4/686_820_2/kfpt20k5gzsp3udhxqdujjk7ypjqqv1o.webp' }, // MAYA P жёсткое с хрусталём → жёсткое Эпиона с хрусталём
    { product_id: 21, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/9ae/686_820_2/r49hbhf0qqaemg1m23tjkfv8w9xwhiv3.webp' }, // LUNA чокер с жемчугом → чокер с жемчугом Галатея
    { product_id: 22, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/b0c/686_820_2/py68rw4s6oga9rl15t4wqqeyz3afu1gz.webp' }, // EROS цепочка с гранатом → колье с гранатом Эрос (точное совпадение)
    { product_id: 23, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/b29/686_820_2/p7pimbvosngm4jp45letqopyjfew0e3a.webp' }, // ORBIT многослойное → колье с подвесками
    // Уход и хранение
    { product_id: 24, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/c61/686_820_2/y5tva87uwny6ed46em0jjzwd2upjtqgq.webp' }, // набор CLEAN → средство 100мл
    { product_id: 25, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/a7d/686_820_2/gs2iaqhtxkug7wtrdqzb5p9mwdo5nbmx.webp' }, // шкатулка VELVET → средство 30мл
    { product_id: 26, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/a75/686_820_2/eknoynxc3mjblr9rqjprkohyvkgc24y5.webp' }, // полироль SHINE → пенка для чистки
    { product_id: 27, image_url: 'https://mie.ru/upload/webp4/resize_cache/iblock/a7d/686_820_2/gs2iaqhtxkug7wtrdqzb5p9mwdo5nbmx.webp' }, // ткань для полировки → средство для чистки
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM product_images');
        console.log('Старые изображения удалены');

        for (const img of images) {
            await client.query(
                'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ($1, $2, true, 0)',
                [img.product_id, img.image_url]
            );
            console.log(`✓ Товар #${img.product_id}`);
        }

        console.log(`\nГотово: добавлено ${images.length} изображений`);
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);

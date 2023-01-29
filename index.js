const { JSDOM } = require('jsdom');
const queue = require('async/queue');
const fs = require('fs');

const data = [];

/**
 * @param {string} url - ссылка для парсинга
 * @param {boolean} isDetailed - истина, если парсим страницу с карточкой товара
 * @return {Promise<void>}
 */
async function parse(url, isDetailed) {
    try {
        const dom = await JSDOM.fromURL(url);
        const d = dom.window.document;

        if (!isDetailed) {
            console.log(`Обработка страницы ${url}`);
            const books = d.querySelectorAll('.product-border'); // product-block-wrapper-fix || product-border
            books.forEach(book => {
                const link =  book.querySelector('.product-border > h5 > a').href; // h5 > a
                if (link) {
                    // const detailedUrl =  link.getAttribute('href');
                    q.push({url: link, isDetailed: true});
                }
            });

            const next = d.querySelector('li > a.next');
            if (next) {
                const nextUrl = next.getAttribute('href');
                q.push({url: nextUrl, isDetailed: false});
            }
        } else {
            console.log(`Обработка карточки товара ${url}`);
            const bookName = d.querySelector('.h1').textContent;
            const bookPrice = d.querySelector('.priceService').textContent;
            const bookImg = d.querySelector('img.slider-img').src;

            let bookDescription = '';
            const desc = d.querySelector("div.extra-box-product > section.page_product_box.toggle_frame.more_info_inner > div");
            if (desc) {
                bookDescription = desc.textContent;
            }

            data.push({title: bookName, price: bookPrice, img: bookImg, category: 'Штукатурка'});
        }
    } catch (e) {
        console.error(e);
    }
}

const q = queue(async (data, done) => {
    await parse(data.url, data.isDetailed);
    done();
} );

q.push({url: 'https://famarket.ru/shtukaturka.html', isDetailed: false});

(async () => {
    await q.drain();
    if (data.length > 0) {
        fs.writeFileSync('./result11.txt', JSON.stringify(data));
        console.log(`Сохранено ${data.length} записей`);
    }
})();

console.log('l');
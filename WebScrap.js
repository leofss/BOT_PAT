import pup from 'puppeteer'
import rw from './TwitterClient.js'
const url = "https://www.praiagrande.sp.gov.br/pgnoticias/noticias/assunto_noticia.asp?idAssunto=52";

(async function () {
    const browser = await pup.launch({ args: ['--no-sandbox'], headless: false});
    const page = await browser.newPage();
    await page.goto(url);
    await Promise.all([
        page.waitForNavigation(),
        page.click('.link_pag')
    ]);
    const extractedText = await page.$eval('#divCadaNoticia', (el) => el.innerText);
    FindPat(page, extractedText)
})();

function FindPat(page, txt) {
    let find_pat = txt.match('/PAT');
    if (find_pat == null) {
        console.log("Sem Pat")
    } else {
        const OkPAT = page.url();
        rw.v2.tweet(`Nova vaga no PAT, da uma olhada e boa sorte! ${OkPAT}`);
    }
}
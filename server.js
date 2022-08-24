import pup from 'puppeteer'
import rw from './TwitterClient.js'
import pg from 'pg';
import { config } from 'dotenv';

config();

const client = new pg.Client({
  connectionString: process.env.uri,
  host: process.env.host,
  database: process.env.dbase,
  user: process.env.user,
  port: process.env.port,
  password: process.env.pass,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

const url = "https://www.praiagrande.sp.gov.br/pgnoticias/noticias/assunto_noticia.asp?idAssunto=52";

(async function () {
    const browser = await pup.launch({ args: ['--no-sandbox'], headless: false});
    const page = await browser.newPage();
    await page.goto(url);
    await Promise.all([
        page.waitForNavigation(),
        page.click('.link_pag'),
    ]);
    const extractedText = await page.$eval('#divCadaNoticia', (el) => el.innerText);
    FindPat(page, extractedText);
    await browser.close()
})();


function FindPat(page, txt) {
    const find_pat = txt.match('/PAT');
    if (find_pat == null) {
        console.log("Sem Pat")
    } else {
      const OkPAT = page.url();
      client.query(`SELECT * FROM url ORDER BY ID DESC LIMIT 1`, (err, res) => {
        if (err) throw err;
        if(res.rows[0].url != OkPAT){
          client.query(`INSERT INTO url(url) VALUES ('${OkPAT}');`, (err, res) => {
            if (err) throw err;
          });
          rw.v2.tweet(`Nova vaga no PAT, da uma olhada e boa sorte! ${OkPAT}`)
        }else{
          console.log("PAT ja twittado")
        }
        client.end();
      });
    }
}

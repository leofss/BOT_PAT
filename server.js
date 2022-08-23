import pup from 'puppeteer'
import rw from './TwitterClient.js'
import pg from 'pg';

const client = new pg.Client({
  connectionString: "postgres://kmifvglvbavqbt:38177724368a093646512430c1e907b04affa8b9a1f153687edde12577c28ebf@ec2-18-208-55-135.compute-1.amazonaws.com:5432/dbp9ikdfgt8i0s",
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
            client.end();
          });
          rw.v2.tweet(`Nova vaga no PAT, da uma olhada e boa sorte! ${OkPAT}`)
        }else{
          console.log("PAT ja twittado")
        }
        client.end();
      });
    }
}


const puppeteer = require("../node_modules/puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const HTML_PATH = path.resolve(__dirname, "..", "docs", "relatorio-abnt.html");
const PDF_PATH = path.resolve(__dirname, "..", "docs", "RELATORIO_PROJETO_INTEGRADO_IV.pdf");

async function generate() {
  if (!fs.existsSync(HTML_PATH)) {
    console.error("HTML not found:", HTML_PATH);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const html = fs.readFileSync(HTML_PATH, "utf-8");
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    margin: { top: "30mm", bottom: "20mm", left: "30mm", right: "20mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "",
    footerTemplate: `
      <div style="width:100%; font-size:10px; text-align:center; padding:5px; color:#333; font-family:Times New Roman, serif;">
        <span class="pageNumber"></span>
      </div>
    `,
  });

  await browser.close();
  console.log("PDF gerado:", PDF_PATH);
}

generate().catch((err) => {
  console.error("Erro ao gerar PDF:", err);
  process.exit(1);
});

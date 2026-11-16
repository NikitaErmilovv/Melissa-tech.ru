#!/usr/bin/env node
/**
 * Патчи ТЗ АвтоБлеск (dist-only). Запуск: node scripts/apply-tz-patches.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "opt-autoblesk/dist");
const ASSETS = path.join(DIST, "public/assets");
const BOOT = path.join(DIST, "boot.js");

function patch(file, replacements) {
  let s = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [from, to] of replacements) {
    if (!s.includes(from)) {
      console.warn(`SKIP (not found): ${path.basename(file)} …${from.slice(0, 60)}`);
      continue;
    }
    s = s.split(from).join(to);
    n++;
  }
  fs.writeFileSync(file, s);
  console.log(`OK ${path.basename(file)} (${n} patches)`);
}

// --- boot.js ---
let boot = fs.readFileSync(BOOT, "utf8");

const LOGIN_HELPERS = `
function translitToken(word) {
  const map = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
  let out = "";
  for (const ch of word.trim().toLowerCase()) out += map[ch] ?? (/[a-z0-9]/i.test(ch) ? ch.toLowerCase() : "");
  if (!out) return "User";
  return out.charAt(0).toUpperCase() + out.slice(1);
}
function companySlug(name) {
  return name.trim().split(/\\s+/).map(translitToken).join("").replace(/[^A-Za-z0-9]/g, "") || "Studio";
}
function buildMasterLogin(personName, studioName) {
  const first = translitToken((personName || "").split(/\\s+/)[0] || personName || "Master");
  return \`\${first}.\${companySlug(studioName)}\`.slice(0, 48);
}
function buildOwnerLogin(personName, studioName, at = /* @__PURE__ */ new Date()) {
  const dd = String(at.getDate()).padStart(2, "0");
  const mm = String(at.getMonth() + 1).padStart(2, "0");
  const yy = String(at.getFullYear()).slice(-2);
  return \`\${buildMasterLogin(personName, studioName)}_\${dd}\${mm}\${yy}\`.slice(0, 56);
}
async function ensureUniqueLogin(login) {
  const db = getDb();
  let candidate = login.toLowerCase();
  let n = 2;
  for (;;) {
    const taken = await db.select().from(users).where(eq(users.login, candidate)).limit(1);
    if (taken.length === 0) return candidate;
    candidate = \`\${login.toLowerCase()}\${n}\`;
    n++;
  }
}
function encodeBoardAudience(ids) {
  if (!ids || ids.length === 0 || ids.includes("all")) return "@[all]\\n";
  return \`@[\${ids.join(",")}]\\n\`;
}
function parseBoardNote(raw) {
  const m = /^@\\[([^\\]]*)\\]\\n?/.exec(raw.body || "");
  if (!m) return { audience: "all", text: raw.body };
  const aud = m[1] === "all" || !m[1] ? "all" : m[1].split(",").map((x) => Number(x.trim())).filter((x) => x > 0);
  return { audience: aud, text: (raw.body || "").slice(m[0].length) };
}
function boardVisibleToUser(note, userId) {
  const { audience } = parseBoardNote(note);
  if (audience === "all") return true;
  if (Array.isArray(audience)) return audience.includes(userId);
  return true;
}
`;

if (!boot.includes("function buildOwnerLogin")) {
  boot = boot.replace(
    "async function createStudioWithOwner(input2) {",
    LOGIN_HELPERS + "\nasync function createStudioWithOwner(input2) {"
  );
}

boot = boot.replace(
  `  const unionId = \`email:\${email3}\`;
  const userRes = await db.insert(users).values({
    companyId,
    unionId,
    login: email3,`,
  `  const unionId = \`email:\${email3}\`;
  const ownerLogin = await ensureUniqueLogin(buildOwnerLogin(input2.ownerName, input2.studioName, /* @__PURE__ */ new Date()));
  const userRes = await db.insert(users).values({
    companyId,
    unionId,
    login: ownerLogin,`
);

boot = boot.replace(
  `async function issueStaffCredentials(input2) {
  const db = getDb();
  const company = await getCompanyById(input2.companyId);
  if (!company) throw new Error("\\u041E\\u0440\\u0433\\u0430\\u043D\\u0438\\u0437\\u0430\\u0446\\u0438\\u044F \\u043D\\u0435 \\u043D\\u0430\\u0439\\u0434\\u0435\\u043D\\u0430");
  const login = input2.login.trim().toLowerCase();
  if (login.length < 3) throw new Error("\\u041B\\u043E\\u0433\\u0438\\u043D \\u043E\\u0442 3 \\u0441\\u0438\\u043C\\u0432\\u043E\\u043B\\u043E\\u0432");`,
  `async function issueStaffCredentials(input2) {
  const db = getDb();
  const company = await getCompanyById(input2.companyId);
  if (!company) throw new Error("\\u041E\\u0440\\u0433\\u0430\\u043D\\u0438\\u0437\\u0430\\u0446\\u0438\\u044F \\u043D\\u0435 \\u043D\\u0430\\u0439\\u0434\\u0435\\u043D\\u0430");
  let login = (input2.login || "").trim().toLowerCase();
  if (login.length < 3) login = await ensureUniqueLogin(buildMasterLogin(input2.name, company.name));
  else login = await ensureUniqueLogin(login);`
);

boot = boot.replace(
  `    if (status === "pending") filters.push(eq(registrationRequests.emailConfirmed, true));`,
  `    /* показываем все pending, в т.ч. до подтверждения email */`
);

boot = boot.replace(
  `async function listBoard(companyId) {
  return getDb().select().from(boardNotes).where(eq(boardNotes.companyId, companyId)).orderBy(asc(boardNotes.sortOrder), desc(boardNotes.id));
}`,
  `async function listBoard(companyId, viewerUserId, isAdmin) {
  const rows = await getDb().select().from(boardNotes).where(eq(boardNotes.companyId, companyId)).orderBy(asc(boardNotes.sortOrder), desc(boardNotes.id));
  if (isAdmin) return rows.map((r) => ({ ...r, ...parseBoardNote(r), body: parseBoardNote(r).text }));
  return rows.filter((r) => boardVisibleToUser(r, viewerUserId)).map((r) => ({ ...r, ...parseBoardNote(r), body: parseBoardNote(r).text }));
}`
);

boot = boot.replace(
  `async function addBoardNote(companyId, body) {
  const db = getDb();
  const [top] = await db.select({ n: sql\`COALESCE(MIN(\${boardNotes.sortOrder}), 0)\` }).from(boardNotes).where(eq(boardNotes.companyId, companyId));
  await db.insert(boardNotes).values({
    companyId,
    body: body.trim(),`,
  `async function addBoardNote(companyId, body, audienceIds) {
  const db = getDb();
  const [top] = await db.select({ n: sql\`COALESCE(MIN(\${boardNotes.sortOrder}), 0)\` }).from(boardNotes).where(eq(boardNotes.companyId, companyId));
  const fullBody = encodeBoardAudience(audienceIds) + body.trim();
  await db.insert(boardNotes).values({
    companyId,
    body: fullBody,`
);

boot = boot.replace(
  `  board: authedQuery.query(({ ctx }) => listBoard(tenantCompanyId(ctx.user))),
  addNote: adminQuery.input(external_exports.object({ body: external_exports.string().trim().min(1).max(2e3) })).mutation(async ({ ctx, input: input2 }) => {
    await addBoardNote(tenantCompanyId(ctx.user), input2.body);`,
  `  board: authedQuery.query(({ ctx }) => listBoard(tenantCompanyId(ctx.user), ctx.user.id, ctx.user.role === "admin")),
  addNote: adminQuery.input(external_exports.object({ body: external_exports.string().trim().min(1).max(2e3), audienceIds: external_exports.array(external_exports.union([external_exports.literal("all"), external_exports.number().int().positive()])).optional() })).mutation(async ({ ctx, input: input2 }) => {
    await addBoardNote(tenantCompanyId(ctx.user), input2.body, input2.audienceIds);`
);

if (!boot.includes("openJobs:")) {
  boot = boot.replace(
    `  pay: adminQuery.input(
    external_exports.object({
      userId: external_exports.number().int().positive(),
      payAll: external_exports.boolean().optional(),
      amount: external_exports.number().int().positive().max(1e8).optional(),
      note: external_exports.string().trim().max(255).optional()
    })
  ).mutation(async ({ ctx, input: input2 }) => {`,
    `  openJobs: authedQuery.input(external_exports.object({ userId: external_exports.number().int().positive().optional() }).optional()).query(async ({ ctx, input: input2 }) => {
    const uid = input2?.userId ?? ctx.user.id;
  if (ctx.user.role !== "admin" && uid !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
    const cid = tenantCompanyId(ctx.user);
    const rows = await getDb().select().from(orders).where(and(eq(orders.companyId, cid), eq(orders.materialsSet, true), isNull2(orders.payoutId), eq(orders.status, "done"), or(eq(orders.performedById, uid), eq(orders.performedById2, uid)))).orderBy(desc(orders.id)).limit(80);
    return rows.map((o) => ({
      id: o.id,
      services: o.services,
      amount: o.amount,
      materialCost: o.materialCost,
      pay: o.performedById === uid ? o.payPrimary : o.paySecondary,
      postedAt: o.postedAt
    }));
  }),
  pay: adminQuery.input(
    external_exports.object({
      userId: external_exports.number().int().positive(),
      payAll: external_exports.boolean().optional(),
      amount: external_exports.number().int().positive().max(1e8).optional(),
      note: external_exports.string().trim().max(255).optional()
    })
  ).mutation(async ({ ctx, input: input2 }) => {`
  );
}

boot = boot.replace(
  `  sales: adminQuery.query(async ({ ctx }) => {
    const rows = await listSalesWithoutMaterials(tenantCompanyId(ctx.user));
    return rows.filter((r) => !r.materialsSet);
  }),`,
  `  sales: adminQuery.query(async ({ ctx }) => {
    const companyId = tenantCompanyId(ctx.user);
    const rows = (await listSalesWithoutMaterials(companyId)).filter((r) => !r.materialsSet);
    const db = getDb();
    const staff = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.companyId, companyId));
    const byId = new Map(staff.map((s) => [s.id, s.name]));
    return rows.map((r) => ({
      ...r,
      performerName: r.performedById ? byId.get(r.performedById) ?? null : null,
      performer2Name: r.performedById2 ? byId.get(r.performedById2) ?? null : null
    }));
  }),`
);

if (!boot.includes("chartDayDetail")) {
  boot = boot.replace(
    `    return {
      incomeToday,
      incomeYesterday,
      expenseToday,
      expenseYesterday,
      profitToday: incomeToday - expenseToday,
      ordersToday,
      avgCheckToday: ordersToday > 0 ? Math.round(incomeToday / ordersToday) : 0,
      incomeByCategory: incomeTodayCats.map((c) => ({
        category: c.category,
        total: Number(c.total)
      })),
      expenseByCategory: expenseTodayCats.map((c) => ({
        category: c.category,
        total: Number(c.total)
      })),
      chartDayOffset,
      weekEndOffset,`,
    `    return {
      incomeToday,
      incomeYesterday,
      expenseToday,
      expenseYesterday,
      profitToday: incomeToday - expenseToday,
      ordersToday,
      avgCheckToday: ordersToday > 0 ? Math.round(incomeToday / ordersToday) : 0,
      incomeByCategory: incomeTodayCats.map((c) => ({
        category: c.category,
        total: Number(c.total)
      })),
      expenseByCategory: expenseTodayCats.map((c) => ({
        category: c.category,
        total: Number(c.total)
      })),
      chartDayOffset,
      weekEndOffset,`
  );
  boot = boot.replace(
    `var statsRouter = createRouter({
  summary: authedQuery.input(`,
    `async function ordersForChartDay(companyId, offset, category, kind) {
  const db = getDb();
  const dayExpr = sql\`DATE(DATE_SUB(CURDATE(), INTERVAL \${offset} DAY))\`;
  if (kind === "income") {
    return db.select({ id: orders.id, title: orders.services, amount: orders.amount, category: orders.category, postedAt: orders.postedAt }).from(orders).where(and(eq(orders.companyId, companyId), eq(orders.category, category), isNotNull(orders.postedAt), sql\`DATE(\${orders.postedAt}) = \${dayExpr}\`)).orderBy(desc(orders.amount)).limit(40);
  }
  return db.select({ id: expenses.id, title: expenses.title, amount: expenses.amount, category: expenses.category, createdAt: expenses.createdAt }).from(expenses).where(and(eq(expenses.companyId, companyId), eq(expenses.category, category), sql\`DATE(\${expenses.createdAt}) = \${dayExpr}\`)).orderBy(desc(expenses.amount)).limit(40);
}
var statsRouter = createRouter({
  chartDayDetail: authedQuery.input(external_exports.object({ chartDayOffset: external_exports.number().int().min(0).max(365), category: external_exports.string(), kind: external_exports.enum(["income", "expense"]) })).query(async ({ ctx, input: input2 }) => ordersForChartDay(tenantCompanyId(ctx.user), input2.chartDayOffset, input2.category, input2.kind)),
  summary: authedQuery.input(`
  );
}

fs.writeFileSync(BOOT, boot);
console.log("OK boot.js");

// StudioDetail — убрать KPI, заказы, расходы
const studio = path.join(ASSETS, "StudioDetail-6SJAXUoU.js");
patch(studio, [
  [
    `},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/platform/StudioDetail.tsx",lineNumber:84,columnNumber:7},this),e.jsxDEV("div",{className:"grid grid-cols-2 gap-3 lg:grid-cols-4",children:[e.jsxDEV("div",{className:"card-soft p-5",children:[e.jsxDEV("p",{className:"text-xs font-bold uppercase text-muted-foreground",children:"Выручка всего"}`,
    `},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/platform/StudioDetail.tsx",lineNumber:84,columnNumber:7},this),e.jsxDEV("section",{className:"card-soft space-y-4 p-5",children:[e.jsxDEV("h2",{className:"font-display text-lg font-semibold",children:"Команда"}`,
  ],
  [
    `},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/platform/StudioDetail.tsx",lineNumber:158,columnNumber:7},this),e.jsxDEV("section",{className:"card-soft p-5",children:[e.jsxDEV("h2",{className:"font-display text-lg font-semibold",children:"Заказы"}`,
    `},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/platform/StudioDetail.tsx",lineNumber:158,columnNumber:7},this),e.jsxDEV("section",{className:"card-soft p-5",style:{display:"none"},children:[e.jsxDEV("h2",{className:"font-display text-lg font-semibold",children:"Заказы"}`,
  ],
]);

// Sales rename + executor
patch(path.join(ASSETS, "Sales-JiGtXi0q.js"), [
  ['children:"Продажи"', 'children:"Услуги"'],
  [
    'e.jsxDEV("p",{className:"text-sm text-muted-foreground",children:["Чек ",o(s.amount)]}',
    'e.jsxDEV("p",{className:"text-sm text-muted-foreground",children:["Чек ",o(s.amount),s.performerName?` · ${s.performerName}`:"",s.performer2Name?` + ${s.performer2Name}`:""]}',
  ],
]);

patch(path.join(ASSETS, "AppLayout-Cv967UBa.js"), [
  ['label:"Продажи"', 'label:"Услуги"'],
  ['to:"/sales"', 'to:"/sales"'], // path unchanged
]);

// Payroll — кнопка подробнее (упрощённо: ссылка на openJobs)
const payrollPath = path.join(ASSETS, "Payroll-DIEsSbiz.js");
let payroll = fs.readFileSync(payrollPath, "utf8");
if (!payroll.includes("openJobs")) {
  payroll = payroll.replace(
    'import{t as r,r as N,j as e}',
    'import{t as r,r as N,j as e,L as Lk}'
  );
  payroll = payroll.replace(
    'Number(s.jobs)," выполненных работ"]',
    'Number(s.jobs)," выполненных работ",a&&s.userId?e.jsxDEV(Lk,{to:`/payroll?user=${s.userId}`,className:"ml-2 text-[var(--red)] font-bold",children:"подробнее"},void 0,!1,{},this):null]'
  );
  fs.writeFileSync(payrollPath, payroll);
  console.log("OK Payroll-DIEsSbiz.js");
}

// NewOrder — показывать исполнителя всегда если staff есть; label для мастера
patch(path.join(ASSETS, "NewOrder-BDd8Ia4b.js"), [
  ['label:"Второй мастер и доля первого, %"', 'label:"Второй мастер (плюс) и доля первого, %"'],
  ['o.data&&o.data.length>0?s.jsxDEV(t,{label:"Исполнитель"', 'o.data?s.jsxDEV(t,{label:"Исполнитель"'],
]);

// NewExpense — убрать голос (заглушка без микрофона)
const expPath = path.join(ASSETS, "NewExpense-BY_2RjTe.js");
let exp = fs.readFileSync(expPath, "utf8");
if (exp.includes("SpeechRecognition")) {
  const start = exp.indexOf("function je()");
  const exportIdx = exp.lastIndexOf("export{");
  if (start > 0 && exportIdx > start) {
    // keep imports + stub main - find function ye or main export
    const mainFn = exp.indexOf("function ye()");
    const tail = exp.slice(exportIdx);
    const headEnd = exp.indexOf("const Ee=");
    const head = exp.slice(0, Math.min(start, headEnd > 0 ? headEnd : start));
    exp = head + `function je(){return null}
` + exp.slice(mainFn, exportIdx) + tail;
    exp = exp.replace(/re\(/g, "oe(").replace(/"Микрофон"/g, '"—"').replace(/getUserMedia/g, "___noop");
    fs.writeFileSync(expPath, exp);
    console.log("OK NewExpense-BY_2RjTe.js (voice stripped)");
  }
}

console.log("Done. Review StudioDetail manually if duplicate Team section.");
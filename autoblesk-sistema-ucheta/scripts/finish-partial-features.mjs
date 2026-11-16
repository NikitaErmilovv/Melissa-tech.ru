#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ASSETS = path.resolve(import.meta.dirname, "../opt-autoblesk/dist/public/assets");

// --- Dashboard: drill-down on donut click ---
const dashPath = path.join(ASSETS, "Dashboard-CCRitOQS.js");
let dash = fs.readFileSync(dashPath, "utf8");
dash = dash.replace(
  "function Mb({title:e,data:t,meta:r,emptyText:n})",
  "function Mb({title:e,data:t,meta:r,emptyText:n,kind:kindProp,dayOffset:dayOff,onPick:pick})"
);
dash = dash.replace(
  /f&&a\(l=>l===f\?null:f\)\}/,
  "f&&pick?pick({category:f,kind:kindProp}):a(l=>l===f?null:f)}"
);
if (!dash.includes("chartPick")) {
  dash = dash.replace(
    "[f,l]=W.useState(\"\"),[aud,setAud]",
    "[chartPick,setChartPick]=W.useState(null),detailQ=Pt.stats.chartDayDetail.useQuery(chartPick??{chartDayOffset:0,category:\"wash\",kind:\"income\"},{enabled:!!chartPick}),[f,l]=W.useState(\"\"),[aud,setAud]"
  );
  dash = dash.replace(
    'data:h.incomeByCategory},void 0,!1',
    "data:h.incomeByCategory,kind:\"income\",dayOffset:chartOff,onPick:setChartPick},void 0,!1"
  );
  dash = dash.replace(
    'data:h.expenseByCategory},void 0,!1',
    "data:h.expenseByCategory,kind:\"expense\",dayOffset:chartOff,onPick:setChartPick},void 0,!1"
  );
  const weekNav = 'children:"Позже →"';
  const ins =
    ',chartPick?R.jsxDEV("section",{className:"card-soft mt-4 space-y-2 p-5",children:[R.jsxDEV("div",{className:"flex items-center justify-between",children:[R.jsxDEV("h3",{className:"font-bold",children:"Детализация за день"},void 0,!1,{},this),R.jsxDEV("button",{type:"button",className:"text-xs font-bold text-[var(--red)]",onClick:()=>setChartPick(null),children:"Закрыть"},void 0,!1,{},this)]},void 0,!0,{},this),detailQ.isLoading?R.jsxDEV("p",{className:"text-sm text-muted-foreground",children:"Загрузка…"},void 0,!1,{},this):R.jsxDEV("ul",{className:"divide-y divide-border text-sm",children:(detailQ.data??[]).map(row=>R.jsxDEV("li",{className:"flex justify-between gap-3 py-2",children:[R.jsxDEV("span",{className:"truncate font-medium",children:row.title??row.services??"Запись"},void 0,!1,{},this),R.jsxDEV("span",{className:"nums font-bold",children:Qe(row.amount??0)},void 0,!1,{},this)]},row.id,!0,{},this))},void 0,!1,{},this)]},void 0,!0,{},this):null';
  if (dash.includes(weekNav) && !dash.includes("chartPick?R.jsxDEV")) {
    dash = dash.replace(weekNav, weekNav + ins);
  }
  dash = dash.replace(
    "pick({category:f,kind:kindProp})",
    "pick({category:f,kind:kindProp,chartDayOffset:dayOff??0})"
  );
}
fs.writeFileSync(dashPath, dash);
console.log("Dashboard", dash.includes("chartPick"), dash.includes("onPick:setChartPick"));

// --- NewOrder: plus + search for 2nd master ---
const orderPath = path.join(ASSETS, "NewOrder-BDd8Ia4b.js");
let order = fs.readFileSync(orderPath, "utf8");
const oldBlockAlt = `o.data&&o.data.length>1?s.jsxDEV(t,{label:"Доп. мастер (плюс) и доля первого, %",children:[!n?s.jsxDEV("button"`;
const oldBlock = `o.data&&o.data.length>1?s.jsxDEV(t,{label:"Второй мастер (плюс) и доля первого, %",children:[s.jsxDEV("select",{className:"input-warm",value:n,onChange:e=>z(e.target.value),children:[s.jsxDEV("option",{value:"",children:"Не нужен"},void 0,!1,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:284,columnNumber:13},this),o.data.map(e=>s.jsxDEV("option",{value:e.id,children:e.name},e.id,!1,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:286,columnNumber:15},this))]},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:283,columnNumber:11},this),n?s.jsxDEV("input",{className:"input-warm mt-2",inputMode:"numeric",value:d,onChange:e=>J(e.target.value.replace(/\\D/g,"").slice(0,3))},void 0,!1,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:292,columnNumber:13},this):null,n&&(Number(d)>65||Number(d)<35)?s.jsxDEV("p",{className:"mt-1 text-xs font-bold text-[var(--red)]",children:"Доля вне 35–65% подсветит заказ как подозрительный."},void 0,!1,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:300,columnNumber:13},this):null]},void 0,!0,{fileName:"/workspace/archive-lab/projects/Kimi_Agent_АвтоБлеск/src/pages/NewOrder.tsx",lineNumber:282,columnNumber:9},this):null`;

const newBlock = `o.data&&o.data.length>1?s.jsxDEV(t,{label:"Доп. мастер (плюс) и доля первого, %",children:[!n&&!extraOpen?s.jsxDEV("button",{type:"button",className:"btn-ghost h-10 gap-2",onClick:()=>{setExtraOpen(!0);setMasterSearch("")},children:[s.jsxDEV(de,{className:"h-4 w-4"},void 0,!1,{},this)," Добавить мастера"]},void 0,!0,{},this):null,(n||extraOpen)?s.jsxDEV("div",{className:"card-soft space-y-2 p-3",children:[s.jsxDEV("div",{className:"flex gap-2",children:[s.jsxDEV("input",{className:"input-warm",value:masterSearch,placeholder:"Поиск по имени",onChange:e=>setMasterSearch(e.target.value)},void 0,!1,{},this),s.jsxDEV("input",{className:"input-warm w-24",inputMode:"numeric",value:d,placeholder:"Доля 1-го %",onChange:e=>J(e.target.value.replace(/\\D/g,"").slice(0,3))},void 0,!1,{},this),s.jsxDEV("button",{type:"button",className:"text-xs font-bold text-[var(--red)]",onClick:()=>{z("");setExtraOpen(!1);setMasterSearch("")},children:"Убрать"},void 0,!1,{},this)]},void 0,!0,{},this),s.jsxDEV("ul",{className:"max-h-32 divide-y divide-border overflow-y-auto",children:(o.data??[]).filter(e=>!masterSearch.trim()||e.name.toLowerCase().includes(masterSearch.trim().toLowerCase())).filter(e=>String(e.id)!==f).slice(0,8).map(e=>s.jsxDEV("li",{children:s.jsxDEV("button",{type:"button",className:"w-full px-2 py-2 text-left text-sm font-medium hover:bg-muted/40",onClick:()=>{z(String(e.id));setMasterSearch(e.name)},children:e.name},void 0,!1,{},this)},e.id,!1,{},this))},void 0,!1,{},this)]},void 0,!0,{},this):null,n&&(Number(d)>65||Number(d)<35)?s.jsxDEV("p",{className:"mt-1 text-xs font-bold text-[var(--red)]",children:"Доля вне 35–65% подсветит заказ как подозрительный."},void 0,!1,{},this):null]},void 0,!0,{},this):null`;

if (order.includes(oldBlock)) {
  order = order.replace(oldBlock, newBlock);
} else if (order.includes("Доп. мастер (плюс)") && !order.includes("extraOpen")) {
  order = order.replace(/o\.data&&o\.data\.length>1\?s\.jsxDEV\(t,\{label:"Доп\. мастер[^?]+\?:null/, newBlock);
} else if (order.includes("extraOpen")) {
  console.log("NewOrder already patched");
} else {
  console.warn("NewOrder block not found");
}
if (!order.includes("extraOpen")) {
  order = order.replace(
    "[M,W]=r.useState(\"\")",
    "[masterSearch,setMasterSearch]=r.useState(\"\"),[extraOpen,setExtraOpen]=r.useState(!1),[M,W]=r.useState(\"\")"
  );
}
order = order.replace(
  "performedById2:n?Number(n):void 0",
  'performedById2:n&&Number(n)>0?Number(n):void 0'
);
fs.writeFileSync(orderPath, order);

// --- Payroll: expandable jobs ---
const payrollPath = path.join(ASSETS, "Payroll-DIEsSbiz.js");
const payroll = `import{t as r,r as N,j as e}from"./index-BqucrLDD.js";import{u as h}from"./useAuth-CJjFaUKZ.js";import{f as o,e as f}from"./format-_Ay8vSIE.js";import{S as b}from"./skeleton-ByCCVcSE.js";import"./const-CL7-dg2c.js";import"./utils-Bk382tBs.js";
function JobsPanel({userId,open}){const q=r.payroll.openJobs.useQuery({userId},{enabled:open&&!!userId});if(!open)return null;return q.data&&q.data.length?e.jsxDEV("ul",{className:"mt-3 space-y-2 border-t border-border pt-3 text-sm",children:q.data.map(j=>e.jsxDEV("li",{className:"flex justify-between gap-2",children:[e.jsxDEV("span",{className:"truncate",children:j.services??"Работа #"+j.id},void 0,!1,{},this),e.jsxDEV("span",{className:"nums font-bold text-[#2F5D34]",children:o(j.pay??0)},void 0,!1,{},this)]},j.id,!0,{},this))},void 0,!1,{},this):e.jsxDEV("p",{className:"mt-2 text-xs text-muted-foreground",children:"Нет открытых работ"},void 0,!1,{},this)}
function E(){const{user:x}=h(),a=x?.role==="admin",m=r.useUtils(),l=r.payroll.open.useQuery(),i=r.payroll.history.useQuery(),[c,n]=N.useState(""),[u,p]=N.useState(null),[openJobs,setOpenJobs]=N.useState(null),d=r.payroll.pay.useMutation({onSuccess:()=>{n(""),p(null),setOpenJobs(null),m.payroll.open.invalidate(),m.payroll.history.invalidate(),m.payroll.openJobs.invalidate()},onError:s=>p(s.message)});return e.jsxDEV("div",{className:"space-y-6",children:[e.jsxDEV("div",{children:[e.jsxDEV("p",{className:"text-xs font-bold uppercase tracking-[0.18em] text-[var(--red)]",children:"Зарплата"},void 0,!1,{},this),e.jsxDEV("h1",{className:"font-display mt-1 text-3xl font-semibold tracking-tight",children:a?"Выработка мастеров":"Моя выработка"},void 0,!1,{},this)]},void 0,!0,{},this),u&&e.jsxDEV("p",{className:"rounded-2xl bg-[var(--red)]/10 px-4 py-3 text-sm font-bold text-[var(--red)]",children:u},void 0,!1,{},this),l.data?l.data.length===0?e.jsxDEV("div",{className:"card-soft px-6 py-10 text-center",children:e.jsxDEV("p",{className:"font-display text-xl font-semibold",children:"К выплате пока ничего"},void 0,!1,{},this)},void 0,!1,{},this):e.jsxDEV("ul",{className:"grid gap-3 lg:grid-cols-2",children:l.data.map(s=>e.jsxDEV("li",{className:"card-soft p-5",children:[e.jsxDEV("p",{className:"font-display text-2xl font-semibold",children:s.name??"Не назначен"},void 0,!1,{},this),e.jsxDEV("p",{className:"nums mt-3 text-3xl font-extrabold text-[#2F5D34]",children:o(Number(s.total))},void 0,!1,{},this),e.jsxDEV("p",{className:"mt-1 text-sm text-muted-foreground",children:[Number(s.jobs)," выполненных работ",s.userId?e.jsxDEV("button",{type:"button",className:"ml-2 font-bold text-[var(--red)]",onClick:()=>setOpenJobs(openJobs===s.userId?null:s.userId),children:openJobs===s.userId?"скрыть":"подробнее"},void 0,!1,{},this):null]},void 0,!0,{},this),s.userId?e.jsxDEV(JobsPanel,{userId:s.userId,open:openJobs===s.userId||!a&&s.userId===x?.id},void 0,!1,{},this):null,a&&s.userId?e.jsxDEV("motion",{className:"mt-4 space-y-2",children:[e.jsxDEV("input",{className:"input-warm",placeholder:"Комментарий",value:c,onChange:t=>n(t.target.value)},void 0,!1,{},this),e.jsxDEV("button",{type:"button",className:"btn-primary h-11 w-full",disabled:d.isPending,onClick:()=>window.confirm("Выплатить и обнулить период?")&&d.mutate({userId:s.userId,note:c.trim()||void 0}),children:"Выплачено"},void 0,!1,{},this)]},void 0,!0,{},this):null]},s.userId??"x",!0,{},this))},void 0,!1,{},this):e.jsxDEV(b,{className:"h-28 rounded-3xl"},void 0,!1,{},this),e.jsxDEV("section",{className:"space-y-3",children:[e.jsxDEV("h2",{className:"font-display text-xl font-semibold",children:"История"},void 0,!1,{},this),i.data?.length?e.jsxDEV("ul",{className:"card-soft divide-y divide-border",children:i.data.map(({payout:s,name:t})=>e.jsxDEV("li",{className:"flex justify-between px-5 py-4",children:[e.jsxDEV("div",{children:[e.jsxDEV("p",{className:"font-bold",children:t??"Мастер"},void 0,!1,{},this),e.jsxDEV("p",{className:"text-xs text-muted-foreground",children:[f(s.paidAt)," · ",s.orderCount," работ"]},void 0,!0,{},this)]},void 0,!0,{},this),e.jsxDEV("p",{className:"nums font-extrabold",children:o(s.amount)},void 0,!1,{},this)]},s.id,!0,{},this))},void 0,!1,{},this):e.jsxDEV("p",{className:"text-sm text-muted-foreground",children:"Истории нет"},void 0,!1,{},this)]},void 0,!0,{},this)]},void 0,!0,{},this)}export{E as default};`;
fs.writeFileSync(payrollPath, payroll.replace(/e\.jsxDEV\("motion"/g, 'e.jsxDEV("div"'));
console.log("Payroll rewritten");
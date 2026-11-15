/**
 * Фрагмент для будущей сборки src: переключение дня на главной (только графики).
 * KPI «сегодня» не меняются; chartDayOffset / weekEndOffset уходят в stats.summary.
 */
// const [chartDayOffset, setChartDayOffset] = useState(0);
// const summary = trpc.stats.summary.useQuery(
//   { chartDayOffset, weekEndOffset: chartDayOffset },
//   { refetchInterval: 60_000 },
// );
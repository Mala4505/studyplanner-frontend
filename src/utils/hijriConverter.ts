export function gregorianToHijri(gregorianDate: Date): string {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();
  let jd = Math.floor(1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12)) / 4) + Math.floor(367 * (gMonth - 2 - 12 * Math.floor((gMonth - 14) / 12)) / 12) - Math.floor(3 * Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100) / 4) + gDay - 32075;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor(50 * l2 / 17719) + Math.floor(l2 / 5670) * Math.floor(43 * l2 / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const hMonth = Math.floor(24 * l3 / 709);
  const hDay = l3 - Math.floor(709 * hMonth / 24);
  const hYear = 30 * n + j - 30;
  const hijriMonths = ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];
  return `${hDay} ${hijriMonths[hMonth - 1]} ${hYear}`;
}
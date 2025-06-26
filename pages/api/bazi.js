export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { birthdate } = req.body;
  if (!birthdate) return res.status(400).json({ error: 'Missing birthdate' });

  try {
    const date = new Date(birthdate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    // 天干地支
    const heavenlyStems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const earthlyBranches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const stemBranch60 = [];
    for (let i = 0; i < 60; i++) {
      const stem = heavenlyStems[i % 10];
      const branch = earthlyBranches[i % 12];
      stemBranch60.push(stem + branch);
    }

    // 年柱
    const baseYear = 1984;
    const yearIndex = (year - baseYear + 60) % 60;
    const yearPillar = stemBranch60[yearIndex];

    // 月柱（简化）
    const monthBranch = earthlyBranches[(month + 1) % 12];
    const monthStem = heavenlyStems[(yearIndex * 2 + month) % 10];
    const monthPillar = monthStem + monthBranch;

    // 日柱（简化）
    const base = new Date(year, 0, 1);
    const daysSinceBase = Math.floor((date - base) / (1000 * 60 * 60 * 24));
    const dayIndex = (daysSinceBase + 0) % 60;
    const dayPillar = stemBranch60[dayIndex];

    // 时柱
    const timeBranches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourBranch = timeBranches[hourIndex];
    const dayStemIndex = heavenlyStems.indexOf(dayPillar[0]);
    const hourStem = heavenlyStems[(dayStemIndex * 2 + hourIndex) % 10];
    const hourPillar = hourStem + hourBranch;

    const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];

    // 五行映射
    const elementMap = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
      '子': '水', '丑': '土',
      '寅': '木', '卯': '木',
      '辰': '土', '巳': '火',
      '午': '火', '未': '土',
      '申': '金', '酉': '金',
      '戌': '土', '亥': '水'
    };

    const elements = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    bazi.forEach(pillar => {
      const gan = pillar[0];
      const zhi = pillar[1];
      elements[elementMap[gan]]++;
      elements[elementMap[zhi]]++;
    });

    // 缺失五行
    const missingElements = Object.entries(elements)
      .filter(([_, count]) => count === 0)
      .map(([key]) => key);

    // 推荐水晶
    const crystalMap = {
      木: [
        { name: "Green Phantom Quartz", reason: "Promotes growth and vitality.", link: "/products/green-phantom" }
      ],
      火: [
        { name: "Carnelian", reason: "Boosts confidence and creativity.", link: "/products/carnelian" }
      ],
      土: [
        { name: "Tiger Eye", reason: "Provides grounding and clarity.", link: "/products/tiger-eye" }
      ],
      金: [
        { name: "White Quartz", reason: "Sharpens focus and enhances discipline.", link: "/products/white-quartz" }
      ],
      水: [
        { name: "Aquamarine", reason: "Brings calm and clear communication.", link: "/products/aquamarine" }
      ]
    };

    const recommendedCrystals = missingElements.flatMap(el => crystalMap[el]);

    return res.status(200).json({
      bazi,
      elements,
      missingElements,
      recommendedCrystals
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error in Bazi calculation.' });
  }
}

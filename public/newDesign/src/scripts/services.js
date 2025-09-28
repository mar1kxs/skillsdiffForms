export const services = {
  dota2: {
    name: "Dota 2",
    description: "Тренировки в Dota 2",
    packages: {
      immortal: { name: "Immortal", hours: 16, price: 9499, type: "hours" },
      divine: { name: "Divine+", hours: 8, price: 4999, type: "hours" },
      start: { name: "Start", hours: 4, price: 2999, type: "hours" },
      single: { name: "1 Тренировка", hours: 1, price: 11, type: "hours" },
      friend2: { name: "2 человека", hours: 1, price: 879, type: "hours" },
      friend3: { name: "3 человека", hours: 1, price: 1199, type: "hours" },
      friend4: { name: "4 человека", hours: 1, price: 1439, type: "hours" },
      friend5: { name: "Full-stack", hours: 1, price: 1679, type: "hours" },
    },
  },
  valorant: {
    name: "Valorant",
    description: "Тренировки в Valorant",
    packages: {
      radiant: { name: "Radiant", hours: 16, price: 9499, type: "hours" },
      immortal: { name: "Immortal+", hours: 8, price: 4999, type: "hours" },
      start: { name: "Start", hours: 4, price: 2999, type: "hours" },
      single: { name: "1 Тренировка", hours: 1, price: 799, type: "hours" },
      friend2: { name: "2 человека", hours: 1, price: 879, type: "hours" },
      friend3: { name: "3 человека", hours: 1, price: 1199, type: "hours" },
      friend4: { name: "4 человека", hours: 1, price: 1439, type: "hours" },
      friend5: { name: "Full-stack", hours: 1, price: 1679, type: "hours" },
    },
  },
  valCoach: {
    name: "Valorant",
    description: "Аналитика / Party в Valorant",
    packages: {
      analysis: {
        name: "Анализ игры в Valorant",
        hours: 1,
        price: 1599,
        type: "analysis",
      },
      party: {
        name: "Party-игры \nс тренером",
        hours: 5,
        price: 3199,
        type: "games",
      },
    },
  },
  dotaCoach: {
    name: "Dota 2",
    description: "Аналитика / Party в Dota 2",
    packages: {
      analysis: {
        name: "Анализ игры в Dota 2",
        hours: 1,
        price: 1599,
        type: "analysis",
      },
      party: {
        name: "Party-игры с тренером",
        hours: 5,
        price: 3199,
        type: "games",
      },
    },
  },
};

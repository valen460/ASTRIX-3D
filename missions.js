export const missions = [
  { name: "Réparer les câbles", room: "Électricité", duration: 5 },
  { name: "Démarrer les moteurs", room: "Moteurs", duration: 7 },
  { name: "Scanner les données", room: "Laboratoire", duration: 6 },
  { name: "Nettoyer les filtres", room: "Oxygène", duration: 5 },
  { name: "Calibrer le bouclier", room: "Boucliers", duration: 8 },
  { name: "Télécharger les fichiers", room: "Administration", duration: 10 },
  { name: "Réparer le réacteur", room: "Réacteur", duration: 8 },
  { name: "Aligner la navigation", room: "Navigation", duration: 6 }
];

export function getRandomMission() {
  return missions[Math.floor(Math.random() * missions.length)];
}

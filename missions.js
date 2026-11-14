
export const missions = [
  { id: 1, name: "Réparer le réacteur", room: "Salle du réacteur", duration: 12, completed: false },
  { id: 2, name: "Stabiliser les moteurs", room: "Salle des moteurs", duration: 10, completed: false },
  { id: 3, name: "Calibrer les boucliers", room: "Salle de contrôle", duration: 8, completed: false },
  { id: 4, name: "Rétablir l'électricité", room: "Salle électrique", duration: 15, completed: false },
  { id: 5, name: "Débloquer les communications", room: "Salle des communications", duration: 10, completed: false }
];

export const sabotages = [
  { id: "lights", name: "Panne électrique", description: "Les lumières du vaisseau s'éteignent." },
  { id: "reactor", name: "Urgence réacteur", description: "Le réacteur doit être stabilisé." },
  { id: "doors", name: "Portes bloquées", description: "Certaines portes du vaisseau se verrouillent." },
  { id: "communications", name: "Communications coupées", description: "Les communications sont interrompues." }
];

export function completeMission(id) {
  const mission = missions.find(m => m.id === id);
  if (!mission || mission.completed) return false;
  mission.completed = true;
  return true;
}

export function getMissionProgress() {
  const completed = missions.filter(m => m.completed).length;
  return {
    completed,
    total: missions.length,
    percentage: Math.round((completed / missions.length) * 100)
  };
}

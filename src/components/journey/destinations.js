export const DESTINATIONS = [
  {
    id: "skills",
    label: "Skills",
    caption: "From curiosity to craft",
    description: "Explore the things I build with.",
    camera: [2, 0.5, -23],
    target: [1.6, 0, -35],
  },
  {
    id: "projects",
    label: "Work",
    caption: "Ideas into working software",
    description: "A closer look at what I've built.",
    camera: [-8, 0.5, -63],
    target: [-8.4, 0, -75],
  },
  {
    id: "experience",
    label: "Journey",
    caption: "My constellation",
    description: "My beginning, and the work that followed.",
    camera: [6, 0.5, -103],
    target: [5.6, 0, -115],
  },
  {
    id: "contact",
    label: "Contact",
    caption: "Back to Earth",
    description: "Every new idea starts with a conversation.",
    camera: [0, 0.5, -143],
    target: [-0.4, 0, -155],
  },
];

export const PROJECT_COLORS = {
  "AI & ML": "#74c9b8",
  Platforms: "#d6ab78",
  "Web & Creative": "#ac9cdb",
};

export const UNIVERSE_STOPS = [
  {
    id: "about",
    label: "Home",
    title: "Brighty's Earth",
    description: "The person behind this universe.",
    target: [0, 0, 0],
    color: "#91bedb",
  },
  {
    ...DESTINATIONS[0],
    target: [24, 3, -35],
    title: "A network of skills",
    color: "#a1d8c6",
  },
  {
    ...DESTINATIONS[1],
    target: [-24, 9, -68],
    title: "Ideas made real",
    color: "#d5b58d",
  },
  {
    ...DESTINATIONS[2],
    target: [30, -4, -110],
    title: "My constellation",
    color: "#b6abdf",
  },
  {
    ...DESTINATIONS[3],
    target: [-12, -6, -145],
    title: "A new conversation",
    color: "#91bedb",
  },
];

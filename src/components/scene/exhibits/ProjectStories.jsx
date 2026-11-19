import {
  Conversation,
  Retriever,
  DataQuery,
  Gateway,
  Workflow,
  Tenants,
  Workout,
} from "./SystemExhibits";
import {
  Publisher,
  SkinScan,
  VisualAssistant,
  Classifier,
  SpeechEmotion,
  Sentiment,
} from "./MediaExhibits";
import {
  Ballot,
  Commerce,
  Events,
  PortfolioWorld,
  ResponsiveSites,
  SharedEditor,
  Bingo,
  Treasure,
} from "./ExperienceExhibits";

const EXHIBITS = {
  conversation: Conversation,
  publishing: Publisher,
  retrieval: Retriever,
  query: DataQuery,
  routing: Gateway,
  workflow: Workflow,
  skin: SkinScan,
  assistant: VisualAssistant,
  emotion: SpeechEmotion,
  voting: Ballot,
  tenants: Tenants,
  workout: Workout,
  classifier: Classifier,
  commerce: Commerce,
  events: Events,
  sentiment: Sentiment,
  universe: PortfolioWorld,
  responsive: ResponsiveSites,
  collaboration: SharedEditor,
  bingo: Bingo,
  treasure: Treasure,
};

export default function ProjectStories({ animation, ...props }) {
  const Exhibit = EXHIBITS[animation];
  return (
    <group name={`project-story-${animation}`}>
      <Exhibit {...props} />
    </group>
  );
}

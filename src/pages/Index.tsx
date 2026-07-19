import { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import SpaceJourney from "../components/SpaceJourney";
import Astronaut from "../components/Astronaut";
import CursorGlow from "../components/CursorGlow";
import ScrollProgress from "../components/ScrollProgress";
import MotionToggle from "../components/MotionToggle";
import MotionSuggestion from "../components/MotionSuggestion";
import { MotionProvider } from "../lib/motion";
import { SoundProvider } from "../lib/sound";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Works from "../components/Works";
import Services from "../components/Services";
import Resume from "../components/Resume";
import Explorations from "../components/Explorations";
import Footer from "../components/Footer";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <MotionProvider>
      <SoundProvider>
        <div className="min-h-screen">
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
          <SpaceJourney />
          <Astronaut />
          <CursorGlow />
          <ScrollProgress />
          <MotionToggle />
          <MotionSuggestion />
          <Navbar />
          <main>
            <Hero />
            <Works />
            <Services />
            <Resume />
            <Explorations />
          </main>
          <Footer />
        </div>
      </SoundProvider>
    </MotionProvider>
  );
};

export default Index;

import "../styles/portal.css";
import PortalNavbar from "../components/PortalNavbar";
import PortalHero from "../components/PortalHero";
import PortalServices from "../components/PortalServices";
import PortalRukoPriok from "../components/PortalRukoPriok";
import PortalTeam from "../components/PortalTeam";
import PortalContact from "../components/PortalContact";
import PortalFooter from "../components/PortalFooter";
import ScrollToTop from "../components/ScrollToTop";

export default function LandingGateway({ onSelect }) {
  const scrollToServices = () =>
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ overflowX: "hidden", minHeight: "100vh" }}>
      <PortalNavbar onBackToWork={scrollToServices} />
      <PortalHero onSelect={onSelect} onScrollDown={scrollToServices} />
      <PortalServices onSelect={onSelect} />
      <PortalRukoPriok />
      <PortalTeam />
      <PortalContact />
      <PortalFooter onSelect={onSelect} />
      <ScrollToTop />
    </div>
  );
}

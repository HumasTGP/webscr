import { useState } from "react";
import { Instagram, Linkedin, User } from "lucide-react";
import { TEAM } from "../data/teamData";
import { useReveal } from "../hooks/useReveal";

export default function PortalTeam() {
  const [headerRef, headerVisible] = useReveal();

  return (
    <section className="portal-section portal-section-alt" id="team">
      <div className="portal-section-inner">
        <div
          ref={headerRef}
          className={`portal-section-header portal-reveal ${headerVisible ? "visible" : ""}`}
        >
          <h2 className="portal-section-title">Tim Kami</h2>
          <div className="portal-section-divider" />
          <p className="portal-section-subtitle">
            Kenali tim yang bekerja di balik sistem digital PLN Indonesia Power
            UBP Priok.
          </p>
        </div>

        <div className="portal-team-grid">
          {TEAM.map((member, i) => (
            <TeamCard key={member.id} member={member} delay={i * 0.13} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, delay }) {
  const [ref, visible] = useReveal();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      className={`portal-team-card portal-reveal ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="portal-team-img-wrap">
        {member.photo && !imgError ? (
          <img src={member.photo} alt={member.name} onError={() => setImgError(true)} />
        ) : (
          <div className="portal-team-avatar">
            <User size={42} />
          </div>
        )}
      </div>

      <div className="portal-team-body">
        <div className="portal-team-name">{member.name}</div>
        <div className="portal-team-role">{member.role}</div>
        <div className="portal-team-divider" />
        <div className="portal-team-social">
          <a
            href={member.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-team-social-link ig"
            aria-label={`Instagram ${member.name}`}
          >
            <Instagram size={15} />
          </a>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-team-social-link li"
            aria-label={`LinkedIn ${member.name}`}
          >
            <Linkedin size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}

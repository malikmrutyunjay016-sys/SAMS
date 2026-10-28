import React, { useState } from 'react';
import {
  Play,
  ArrowRight,
  Sparkles,
  TreePine,
  Waves,
  ShieldAlert,
  Globe,
  Users,
  CheckCircle2,
  Mail,
  Heart,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export const VisualShowcaseSection: React.FC<{
  onExploreClick?: () => void;
}> = ({ onExploreClick }) => {
  const [emailHero, setEmailHero] = useState('');
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [joinedHero, setJoinedHero] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailHero) return;
    setJoinedHero(true);
    setTimeout(() => setJoinedHero(false), 4000);
    setEmailHero('');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailNewsletter) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmailNewsletter('');
  };

  return (
    <div className="space-y-16 py-6 font-sans text-slate-100">

      {/* Video Modal Preview */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm font-serif">Our Story & Environmental Impact Briefing</h3>
              <button onClick={() => setIsVideoOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>
            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-6 text-center space-y-2">
              <div>
                <TreePine className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Documentary & Mission Video Preview</p>
                <p className="text-xs text-slate-400">Discover how community initiatives drive ecosystem restoration globally.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: OUR MISSION & 3 CARD PILLARS                   */}
      {/* ========================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10 backdrop-blur-md">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Text */}
          <div className="lg:col-span-4 space-y-5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Our Mission</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif leading-tight">
              We're Building a <span className="text-emerald-400">Greener</span>, Cleaner, Stronger World.
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Through education, action, and innovation, we empower people to protect nature and create lasting positive change for generations to come.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center"
              >
                Explore Projects <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
              <button
                onClick={onExploreClick}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column 3 Tall Card Pillars */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Pillar 1 */}
            <div className="group relative h-80 rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl flex flex-col justify-end p-5">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
                alt="Sustainable Land Use"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative z-10 space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-700 text-emerald-400 flex items-center justify-center">
                  <TreePine className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-sm font-serif">Sustainable Land Use</h3>
                <p className="text-[11px] text-slate-300 leading-snug">Promoting responsible land management and agricultural harmony.</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="group relative h-80 rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl flex flex-col justify-end p-5">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
                alt="Climate Action"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative z-10 space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-700 text-sky-400 flex items-center justify-center">
                  <Waves className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-sm font-serif">Climate Action</h3>
                <p className="text-[11px] text-slate-300 leading-snug">Reducing emissions and building climate resilience worldwide.</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="group relative h-80 rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl flex flex-col justify-end p-5">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
                alt="Community Empowerment"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative z-10 space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-700 text-amber-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-sm font-serif">Community Empowerment</h3>
                <p className="text-[11px] text-slate-300 leading-snug">Empowering local heroes and creating grass-roots impact.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Logos Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">TRUSTED BY ORGANIZATIONS:</span>
          {['EarthAlliance', 'GreenGlobal', 'EcoTrust', 'PlanetAction', 'BioSphere', 'NatureZero'].map((brand) => (
            <span key={brand} className="hover:text-emerald-400 transition cursor-default font-serif font-bold">
              ✦ {brand}
            </span>
          ))}
        </div>

      </div>

      {/* ========================================================= */}
      {/* SECTION 3: OUR INITIATIVES & NEWSLETTER WIDGET           */}
      {/* ========================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10 backdrop-blur-md">
        
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          
          {/* Left Column: 3 Image Feature Cards */}
          <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg hover:border-slate-700 transition">
              <div className="relative h-36 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80"
                  alt="Ocean Cleanup"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                  Ocean Cleanup
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white font-serif">Clean Oceans, Bright Future</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">Removing plastic and debris from our oceans and coastlines.</p>
                <button onClick={onExploreClick} className="text-[11px] text-emerald-400 font-semibold flex items-center pt-1 hover:underline">
                  Learn More <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg hover:border-slate-700 transition">
              <div className="relative h-36 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
                  alt="Reforestation"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                  Reforestation
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white font-serif">More Trees, Better Planet</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">Planting and restoring native forests for a healthier Earth.</p>
                <button onClick={onExploreClick} className="text-[11px] text-emerald-400 font-semibold flex items-center pt-1 hover:underline">
                  Learn More <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg hover:border-slate-700 transition">
              <div className="relative h-36 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80"
                  alt="Community"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                  Community
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white font-serif">Stronger Communities, Stronger Future</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">Empowering local communities to lead sustainable change.</p>
                <button onClick={onExploreClick} className="text-[11px] text-emerald-400 font-semibold flex items-center pt-1 hover:underline">
                  Learn More <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Headline & Lime Newsletter Box */}
          <div className="lg:w-5/12 space-y-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Initiatives</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                Real Actions. Real Impact. A Better Future.
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Discover how we turn ideas into real-world impact through dedicated projects that protect ecosystems and support local communities.
              </p>

              <button
                onClick={onExploreClick}
                className="text-xs text-emerald-400 font-bold flex items-center hover:underline pt-1"
              >
                View All Initiatives <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Lime Yellow Newsletter Card (matching image style) */}
            <div className="bg-lime-400 text-slate-950 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="font-extrabold text-lg font-serif">Stay Inspired. Stay Informed.</h3>
              <p className="text-xs font-medium text-slate-900 leading-relaxed">
                Subscribe to our newsletter and receive the latest updates on projects, inspiring stories, and ways to get involved.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={emailNewsletter}
                    onChange={(e) => setEmailNewsletter(e.target.value)}
                    className="w-full bg-white text-slate-900 text-xs px-3.5 py-2.5 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow"
                  >
                    Subscribe <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </form>

              {subscribed && (
                <p className="text-xs font-bold text-slate-950 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-slate-950" /> Subscribed successfully!
                </p>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <img className="inline-block h-6 w-6 rounded-full ring-2 ring-lime-400 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                  <img className="inline-block h-6 w-6 rounded-full ring-2 ring-lime-400 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User" />
                </div>
                <span className="text-[11px] font-semibold text-slate-900">Join thousands of change-makers</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

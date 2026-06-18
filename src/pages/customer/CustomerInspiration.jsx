import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Fallback placeholder cards shown before admin adds real ones
const PLACEHOLDER_ROOMS = [
  { id: 'p1', title: 'Coastal Calm Living',    tag: 'Living Room', description: 'Staged for a waterfront Takapuna property', idea: '', gradient: 'linear-gradient(155deg,#a8c8d8 0%,#d8e8f0 45%,#f0e8d8 100%)', isPlaceholder: true },
  { id: 'p2', title: 'Moody Dining Room',      tag: 'Dining',      description: 'Dramatic dark tones with brass accents',    idea: '', gradient: 'linear-gradient(155deg,#1e1a14 0%,#3c2c14 50%,#806040 100%)', isPlaceholder: true },
  { id: 'p3', title: 'Boudoir Master Suite',   tag: 'Bedroom',     description: 'Soft linen layers for a Grey Lynn villa',  idea: '', gradient: 'linear-gradient(155deg,#d8b8c0 0%,#e8d0c8 55%,#f4ece4 100%)', isPlaceholder: true },
  { id: 'p4', title: 'Minimalist Study Nook',  tag: 'Study',       description: 'Curated shelf styling and natural light',  idea: '', gradient: 'linear-gradient(155deg,#c0d4c4 0%,#dce8d8 50%,#f4f0e8 100%)', isPlaceholder: true },
  { id: 'p5', title: 'Golden Hour Lounge',     tag: 'Living Room', description: 'Warm tones for an inner-city apartment',  idea: '', gradient: 'linear-gradient(155deg,#c07828 0%,#d8a050 45%,#f0d888 100%)', isPlaceholder: true },
  { id: 'p6', title: 'Travertine Kitchen',     tag: 'Kitchen',     description: 'Stone and rattan styling',                idea: '', gradient: 'linear-gradient(155deg,#a89880 0%,#c8bca8 50%,#e8e0d0 100%)', isPlaceholder: true },
  { id: 'p7', title: 'Japandi Reading Corner', tag: 'Living Room', description: 'Curated calm for a Mt Eden bungalow',    idea: '', gradient: 'linear-gradient(155deg,#c0b898 0%,#d8d0b8 50%,#eceae0 100%)', isPlaceholder: true },
  { id: 'p8', title: 'Velvet & Oak Bedroom',   tag: 'Bedroom',     description: 'Rich textures for a Remuera townhouse',  idea: '', gradient: 'linear-gradient(155deg,#281828 0%,#582840 50%,#906858 100%)', isPlaceholder: true },
];

const TAG_GRADIENTS = {
  'Living Room': 'linear-gradient(155deg,#a8c8d8 0%,#d8e8f0 45%,#f0e8d8 100%)',
  'Dining':      'linear-gradient(155deg,#1e1a14 0%,#3c2c14 50%,#806040 100%)',
  'Bedroom':     'linear-gradient(155deg,#d8b8c0 0%,#e8d0c8 55%,#f4ece4 100%)',
  'Study':       'linear-gradient(155deg,#c0d4c4 0%,#dce8d8 50%,#f4f0e8 100%)',
  'Kitchen':     'linear-gradient(155deg,#a89880 0%,#c8bca8 50%,#e8e0d0 100%)',
};

const TAGS = ['All', 'Living Room', 'Dining', 'Bedroom', 'Study', 'Kitchen'];
const SERVICES = ['Full Home Staging', 'Partial Staging', 'Vacant Property', 'Photography Prep', 'Short-Term Hire'];
const EMPTY_FORM = { name: '', email: '', phone: '', address: '', service: 'Full Home Staging', date: '', notes: '' };

const ToilePattern = () => (
  <svg
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="toileHero" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <rect width="200" height="200" fill="#eef5fb"/>
        {/* Urn with flowers */}
        <path d="M24 38 Q26 26 34 28 Q42 26 44 38 L42 56 Q34 62 26 56 Z" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M34 28 L34 14" stroke="#2e5f8a" strokeWidth="0.9" fill="none"/>
        <path d="M34 14 Q28 6 22 8" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q40 6 46 8" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q32 4 34 1" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q38 5 42 3" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M34 14 Q30 5 26 3" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <circle cx="22" cy="8" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="46" cy="8" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="34" cy="1" r="3" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <circle cx="42" cy="3" r="2.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <circle cx="26" cy="3" r="2.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M26 56 Q20 66 18 74 Q24 70 28 74" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M42 56 Q48 66 50 74 Q44 70 40 74" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M18 74 L50 74" stroke="#2e5f8a" strokeWidth="0.8"/>
        {/* Bird on branch */}
        <path d="M110 74 Q125 68 138 72 Q144 77 140 84 Q130 90 118 85 Q108 80 110 74Z" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <circle cx="141" cy="70" r="5" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M146 67 L153 64 L149 70Z" fill="#2e5f8a"/>
        <path d="M110 84 L104 93 L113 89Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M96 98 Q116 95 138 98 Q144 103 138 106 Q116 104 96 104Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M102 106 L102 120 M114 104 L114 120 M126 106 L126 120 M138 106 L138 120" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M92 120 L146 120" stroke="#2e5f8a" strokeWidth="1.4"/>
        <path d="M92 120 Q88 128 86 134 M146 120 Q152 128 154 134" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        {/* Deer / fawn */}
        <ellipse cx="158" cy="158" rx="16" ry="10" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <circle cx="173" cy="148" r="7" fill="none" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M175 141 Q178 132 175 129 M178 141 Q182 132 181 128" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M144 168 L141 184 M150 168 L148 184 M166 168 L167 184 M172 167 L175 184" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <path d="M168 150 Q172 145 176 148" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="155" cy="155" r="1.2" fill="#2e5f8a"/>
        <circle cx="162" cy="153" r="1.2" fill="#2e5f8a"/>
        <circle cx="160" cy="159" r="1.2" fill="#2e5f8a"/>
        {/* Butterfly */}
        <path d="M54 148 Q64 138 74 145 Q68 155 60 154 Q54 154 54 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 148 Q44 138 38 145 Q44 155 52 154 Q54 154 54 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 154 Q62 162 64 157 Q60 168 54 162Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M54 154 Q46 162 44 157 Q48 168 54 162Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <line x1="54" y1="145" x2="54" y2="164" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M54 145 Q49 137 46 134 M54 145 Q59 137 62 134" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        {/* Floral spray bottom-left */}
        <path d="M18 148 Q22 136 30 142 Q26 134 34 134 Q42 134 38 142 Q46 136 50 148 Q42 142 34 146 Q26 142 18 148Z" fill="none" stroke="#2e5f8a" strokeWidth="0.8"/>
        <path d="M34 146 L34 172" stroke="#2e5f8a" strokeWidth="0.9"/>
        <path d="M34 156 Q24 151 18 156 M34 162 Q44 157 50 162" stroke="#2e5f8a" strokeWidth="0.8" fill="none"/>
        <ellipse cx="26" cy="182" rx="8" ry="13" fill="none" stroke="#2e5f8a" strokeWidth="0.8" transform="rotate(-20,26,182)"/>
        <ellipse cx="42" cy="182" rx="8" ry="13" fill="none" stroke="#2e5f8a" strokeWidth="0.8" transform="rotate(20,42,182)"/>
        {/* Small scattered flowers */}
        <circle cx="76" cy="46" r="4" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M76 42 L76 38 M80 43 L84 41 M80 49 L84 51 M72 49 L68 51 M72 43 L68 41" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="182" cy="108" r="4" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M182 104 L182 100 M186 105 L190 103 M186 111 L190 113 M178 111 L174 113 M178 105 L174 103" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="80" cy="192" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M80 188 L80 185 M83 189 L86 187 M83 195 L86 197 M77 195 L74 197 M77 189 L74 187" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        <circle cx="170" cy="36" r="3.5" fill="none" stroke="#2e5f8a" strokeWidth="0.7"/>
        <path d="M170 32 L170 29 M173 33 L176 31 M173 39 L176 41 M167 39 L164 41 M167 33 L164 31" stroke="#2e5f8a" strokeWidth="0.7" fill="none"/>
        {/* Vine connectors */}
        <path d="M50 56 Q70 62 90 80" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M50 148 Q70 136 92 120" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M158 148 Q148 136 142 120" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
        <path d="M76 50 Q100 58 108 74" stroke="#2e5f8a" strokeWidth="0.6" fill="none" strokeDasharray="2,4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#toileHero)"/>
  </svg>
);

export default function CustomerInspiration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTag, setActiveTag] = useState('All');
  const [stagingModal, setStagingModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);

  // Real data from Supabase
  const [dbRooms, setDbRooms] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [detailCard, setDetailCard] = useState(null);
  const [detailPhoto, setDetailPhoto] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    supabase.from('staging_inspiration').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setDbRooms(data || []));
    supabase.from('listings').select('*')
      .then(({ data }) => setAllListings(data || []));
  }, []);

  const rooms = dbRooms && dbRooms.length > 0 ? dbRooms : PLACEHOLDER_ROOMS;
  const filtered = activeTag === 'All' ? rooms : rooms.filter((r) => r.tag === activeTag);

  const addToCart = (item) => {
    setCart((prev) => prev.find((c) => c.id === item.id) ? prev : [...prev, item]);
  };

  const openDetail = (card) => {
    setDetailCard(card);
    setDetailPhoto(card.photo_url || null);
  };

  const openStaging = () => {
    if (!user) { setRequireLogin(true); return; }
    setForm({ ...EMPTY_FORM, name: user.name, email: user.email, phone: user.phone || '' });
    setStagingModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address) return;
    await supabase.from('staging_bookings').insert({
      id: `SB-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      service: form.service,
      date: form.date,
      notes: form.notes,
      status: 'pending',
      quote_sent: false,
    });
    setSubmitted(true);
    setTimeout(() => { setStagingModal(false); setSubmitted(false); setForm(EMPTY_FORM); }, 3000);
  };

  const darkBtn = {
    background: '#1a3a5c', color: '#f0d8c8', border: 'none',
    padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
  };

  const rustOutlineBtn = {
    background: 'transparent', color: '#c04a1a', border: '2px solid #c04a1a',
    padding: '0.85rem 2rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem',
    letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f4ee' }}>
      <CustomerNav onCartClick={() => navigate('/shop')} />

      {/* ── TOILE HERO — full pattern background ── */}
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ToilePattern />
        {/* Dark overlay so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(238,245,251,0.55)' }} />
        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '5rem 2rem', maxWidth: 680 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, marginBottom: '1.25rem' }}>
            Luxury Home Staging · Auckland, NZ
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 600, lineHeight: 1.05, marginBottom: '1.5rem', color: '#0f1e2e' }}>
            Spaces that make<br />
            <em style={{ color: '#2e5f8a', fontWeight: 400 }}>people feel something</em>
          </h1>
          <p style={{ fontSize: '1rem', color: '#2a3d52', maxWidth: 480, margin: '0 auto 2.5rem', lineHeight: 1.9, fontWeight: 400 }}>
            We transform New Zealand properties into aspirational homes — curated luxury furniture, expert styling, unforgettable first impressions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={darkBtn} onClick={openStaging}>Book a Staging</button>
            <button style={rustOutlineBtn} onClick={() => navigate('/shop')}>Browse Furniture →</button>
          </div>
        </div>
        {/* Bottom fade into cream */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #f8f4ee)' }} />
      </section>

      {/* ── FILTER TAGS ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0 0', flexWrap: 'wrap', gap: 0, borderBottom: '2px solid #b8c8d8' }}>
        {TAGS.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)} style={{
            padding: '0.7rem 1.5rem',
            background: activeTag === tag ? '#1a3a5c' : 'transparent',
            color: activeTag === tag ? '#f0d8c8' : '#2a3d52',
            border: '2px solid ' + (activeTag === tag ? '#1a3a5c' : '#b8c8d8'),
            marginRight: '-1px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            fontWeight: 600, transition: 'all 0.2s',
          }}>
            {tag}
          </button>
        ))}
      </div>

      {/* ── GALLERY ── */}
      <section style={{ padding: '2.5rem 2.5rem 5rem', columns: '3 280px', columnGap: '1rem' }}>
        {filtered.map((room, i) => {
          const h = i % 3 === 0 ? 340 : i % 3 === 1 ? 260 : 300;
          const gradient = room.gradient || TAG_GRADIENTS[room.tag] || TAG_GRADIENTS['Living Room'];
          const isDark = gradient.includes('#1e') || gradient.includes('#28');
          const iconColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(30,50,70,0.18)';
          const floorColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(30,50,70,0.10)';
          const allPhotos = [room.photo_url, ...(room.photos || [])].filter(Boolean);

          // SVG room scenes per tag
          const scenes = {
            'Living Room': (
              <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '90%', maxWidth: 240, height: 'auto' }}>
                {/* Floor line */}
                <line x1="10" y1="130" x2="250" y2="130" stroke={iconColor} strokeWidth="1.5"/>
                {/* Sofa body */}
                <rect x="40" y="90" width="140" height="40" rx="8" fill="none" stroke={iconColor} strokeWidth="2"/>
                {/* Sofa back */}
                <rect x="40" y="74" width="140" height="20" rx="6" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                {/* Sofa arms */}
                <rect x="30" y="84" width="16" height="46" rx="5" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <rect x="174" y="84" width="16" height="46" rx="5" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                {/* Cushions */}
                <rect x="52" y="92" width="42" height="34" rx="5" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <rect x="99" y="92" width="42" height="34" rx="5" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <rect x="146" y="92" width="28" height="34" rx="5" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                {/* Coffee table */}
                <rect x="85" y="118" width="90" height="12" rx="3" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="95" y1="130" x2="93" y2="148" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="165" y1="130" x2="167" y2="148" stroke={iconColor} strokeWidth="1.2"/>
                {/* Lamp */}
                <line x1="218" y1="130" x2="218" y2="75" stroke={iconColor} strokeWidth="1.5"/>
                <ellipse cx="218" cy="73" rx="18" ry="8" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="200" y1="68" x2="236" y2="68" stroke={iconColor} strokeWidth="1"/>
                {/* Plant */}
                <line x1="38" y1="130" x2="38" y2="106" stroke={iconColor} strokeWidth="1.2"/>
                <ellipse cx="38" cy="102" rx="12" ry="8" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <ellipse cx="30" cy="96" rx="8" ry="6" fill="none" stroke={iconColor} strokeWidth="1"/>
                <ellipse cx="46" cy="96" rx="8" ry="6" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Rug */}
                <ellipse cx="130" cy="148" rx="68" ry="10" fill="none" stroke={floorColor} strokeWidth="1.2"/>
              </svg>
            ),
            'Dining': (
              <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '90%', maxWidth: 240, height: 'auto' }}>
                <line x1="10" y1="138" x2="250" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Table top */}
                <rect x="65" y="72" width="130" height="10" rx="3" fill="none" stroke={iconColor} strokeWidth="2"/>
                {/* Table legs */}
                <line x1="80" y1="82" x2="78" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="180" y1="82" x2="182" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Left chairs */}
                <rect x="28" y="80" width="32" height="22" rx="5" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <rect x="30" y="68" width="28" height="14" rx="4" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="32" y1="102" x2="30" y2="116" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="56" y1="102" x2="58" y2="116" stroke={iconColor} strokeWidth="1.2"/>
                {/* Right chairs */}
                <rect x="200" y="80" width="32" height="22" rx="5" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <rect x="202" y="68" width="28" height="14" rx="4" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="204" y1="102" x2="202" y2="116" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="228" y1="102" x2="230" y2="116" stroke={iconColor} strokeWidth="1.2"/>
                {/* Place settings */}
                <ellipse cx="106" cy="78" rx="12" ry="5" fill="none" stroke={iconColor} strokeWidth="1"/>
                <ellipse cx="154" cy="78" rx="12" ry="5" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Candle centrepiece */}
                <rect x="124" y="58" width="12" height="16" rx="2" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="130" y1="58" x2="130" y2="50" stroke={iconColor} strokeWidth="1"/>
                <circle cx="130" cy="49" r="3" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Pendant light */}
                <line x1="130" y1="10" x2="130" y2="38" stroke={iconColor} strokeWidth="1"/>
                <path d="M112,38 Q130,52 148,38" fill="none" stroke={iconColor} strokeWidth="1.2"/>
              </svg>
            ),
            'Bedroom': (
              <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '90%', maxWidth: 240, height: 'auto' }}>
                <line x1="10" y1="138" x2="250" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Headboard */}
                <rect x="50" y="50" width="160" height="32" rx="8" fill="none" stroke={iconColor} strokeWidth="2"/>
                {/* Bed base */}
                <rect x="50" y="80" width="160" height="56" rx="4" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                {/* Mattress / bedding */}
                <rect x="56" y="84" width="148" height="48" rx="4" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Pillows */}
                <rect x="66" y="86" width="46" height="26" rx="6" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <rect x="148" y="86" width="46" height="26" rx="6" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                {/* Duvet fold */}
                <path d="M56,118 Q130,112 204,118" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                {/* Bed legs */}
                <line x1="58" y1="136" x2="56" y2="148" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="202" y1="136" x2="204" y2="148" stroke={iconColor} strokeWidth="1.5"/>
                {/* Bedside tables */}
                <rect x="12" y="96" width="32" height="40" rx="3" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="12" y1="116" x2="44" y2="116" stroke={iconColor} strokeWidth="1"/>
                <rect x="216" y="96" width="32" height="40" rx="3" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="216" y1="116" x2="248" y2="116" stroke={iconColor} strokeWidth="1"/>
                {/* Lamps on tables */}
                <line x1="28" y1="96" x2="28" y2="78" stroke={iconColor} strokeWidth="1.2"/>
                <ellipse cx="28" cy="76" rx="14" ry="6" fill="none" stroke={iconColor} strokeWidth="1"/>
                <line x1="232" y1="96" x2="232" y2="78" stroke={iconColor} strokeWidth="1.2"/>
                <ellipse cx="232" cy="76" rx="14" ry="6" fill="none" stroke={iconColor} strokeWidth="1"/>
              </svg>
            ),
            'Study': (
              <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '90%', maxWidth: 240, height: 'auto' }}>
                <line x1="10" y1="138" x2="250" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Desk */}
                <rect x="40" y="90" width="180" height="10" rx="2" fill="none" stroke={iconColor} strokeWidth="2"/>
                <line x1="50" y1="100" x2="48" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="210" y1="100" x2="212" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Desk chair */}
                <rect x="98" y="108" width="44" height="22" rx="6" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <rect x="100" y="100" width="40" height="10" rx="4" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="105" y1="130" x2="102" y2="148" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="135" y1="130" x2="138" y2="148" stroke={iconColor} strokeWidth="1.2"/>
                <line x1="120" y1="130" x2="120" y2="148" stroke={iconColor} strokeWidth="1"/>
                {/* Monitor */}
                <rect x="102" y="58" width="56" height="36" rx="3" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="130" y1="94" x2="130" y2="100" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="116" y1="100" x2="144" y2="100" stroke={iconColor} strokeWidth="1.2"/>
                {/* Bookshelf */}
                <rect x="186" y="30" width="52" height="62" rx="2" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="186" y1="55" x2="238" y2="55" stroke={iconColor} strokeWidth="1"/>
                <line x1="186" y1="75" x2="238" y2="75" stroke={iconColor} strokeWidth="1"/>
                {/* Books */}
                <line x1="196" y1="35" x2="196" y2="55" stroke={iconColor} strokeWidth="2"/>
                <line x1="203" y1="35" x2="203" y2="55" stroke={iconColor} strokeWidth="2"/>
                <line x1="210" y1="35" x2="210" y2="55" stroke={iconColor} strokeWidth="2"/>
                <line x1="218" y1="57" x2="218" y2="75" stroke={iconColor} strokeWidth="2"/>
                <line x1="226" y1="57" x2="226" y2="75" stroke={iconColor} strokeWidth="2"/>
                {/* Desk lamp */}
                <line x1="170" y1="100" x2="170" y2="68" stroke={iconColor} strokeWidth="1.2"/>
                <path d="M170,68 Q178,60 188,66" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <ellipse cx="190" cy="68" rx="10" ry="5" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Plant pot */}
                <rect x="44" y="76" width="20" height="16" rx="3" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <path d="M54,76 Q48,62 42,58 M54,76 Q60,62 66,58 M54,76 Q54,62 54,55" fill="none" stroke={iconColor} strokeWidth="1"/>
              </svg>
            ),
            'Kitchen': (
              <svg viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '90%', maxWidth: 240, height: 'auto' }}>
                <line x1="10" y1="138" x2="250" y2="138" stroke={iconColor} strokeWidth="1.5"/>
                {/* Counter base */}
                <rect x="20" y="98" width="220" height="40" rx="4" fill="none" stroke={iconColor} strokeWidth="2"/>
                {/* Counter top */}
                <rect x="18" y="90" width="224" height="10" rx="3" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                {/* Cabinets */}
                <rect x="22" y="102" width="60" height="32" rx="2" fill="none" stroke={iconColor} strokeWidth="1"/>
                <rect x="88" y="102" width="60" height="32" rx="2" fill="none" stroke={iconColor} strokeWidth="1"/>
                <rect x="154" y="102" width="60" height="32" rx="2" fill="none" stroke={iconColor} strokeWidth="1"/>
                {/* Cabinet handles */}
                <line x1="52" y1="118" x2="52" y2="124" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="118" y1="118" x2="118" y2="124" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="184" y1="118" x2="184" y2="124" stroke={iconColor} strokeWidth="1.5"/>
                {/* Sink */}
                <rect x="96" y="72" width="68" height="20" rx="3" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <circle cx="130" cy="82" r="4" fill="none" stroke={iconColor} strokeWidth="1"/>
                <line x1="130" y1="72" x2="130" y2="62" stroke={iconColor} strokeWidth="1.2"/>
                {/* Upper cabinets */}
                <rect x="20" y="22" width="220" height="42" rx="3" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="90" y1="22" x2="90" y2="64" stroke={iconColor} strokeWidth="1"/>
                <line x1="170" y1="22" x2="170" y2="64" stroke={iconColor} strokeWidth="1"/>
                <line x1="55" y1="43" x2="55" y2="50" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="130" y1="43" x2="130" y2="50" stroke={iconColor} strokeWidth="1.5"/>
                <line x1="205" y1="43" x2="205" y2="50" stroke={iconColor} strokeWidth="1.5"/>
                {/* Stove / cooktop circles */}
                <circle cx="48" cy="82" r="12" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                <circle cx="48" cy="82" r="6" fill="none" stroke={iconColor} strokeWidth="1"/>
                <circle cx="78" cy="82" r="8" fill="none" stroke={iconColor} strokeWidth="1.2"/>
              </svg>
            ),
          };

          const scene = scenes[room.tag] || scenes['Living Room'];

          return (
            <div
              key={room.id}
              style={{ breakInside: 'avoid', marginBottom: '1rem', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => !room.isPlaceholder && openDetail(room)}
              onMouseEnter={(e) => { e.currentTarget.querySelector('.gallery-img').style.transform = 'scale(1.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.querySelector('.gallery-img').style.transform = 'scale(1)'; }}
            >
              <div
                className="gallery-img"
                style={{ width: '100%', height: h, background: gradient, transition: 'transform 0.55s ease', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                {/* Real photo if available, else SVG scene */}
                {allPhotos.length > 0
                  ? <img src={allPhotos[0]} alt={room.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : scene
                }
                {/* Photo count badge */}
                {allPhotos.length > 1 && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(10,20,32,0.65)', color: 'white', fontSize: '0.65rem', letterSpacing: '0.1em', padding: '0.25rem 0.6rem', fontWeight: 700 }}>
                    {allPhotos.length} photos
                  </div>
                )}
                {/* "View idea" prompt on non-placeholder cards */}
                {!room.isPlaceholder && (
                  <div style={{ position: 'absolute', bottom: '3.5rem', right: '1rem', background: 'rgba(240,160,112,0.9)', color: '#0f1e2e', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.3rem 0.65rem', fontWeight: 700 }}>
                    View Details →
                  </div>
                )}
              </div>

              {/* Text overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,32,0.90) 0%, rgba(10,20,32,0.25) 38%, transparent 58%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '0.3rem', fontWeight: 700 }}>{room.tag}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#f8f4ee', marginBottom: '0.2rem', lineHeight: 1.2 }}>{room.title}</h3>
                <p style={{ fontSize: '0.77rem', color: 'rgba(214,232,245,0.72)', fontWeight: 400 }}>{room.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── SERVICES STRIP ── */}
      <section style={{ background: '#1a3a5c', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#f0a070', marginBottom: '1rem', fontWeight: 700 }}>Our Services</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 600, color: '#f8f4ee' }}>
            Staging <em style={{ color: '#d6e8f5', fontWeight: 400 }}>for every need</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'rgba(214,232,245,0.15)' }}>
          {SERVICES.map((s) => (
            <div key={s} style={{ background: '#1a3a5c', padding: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: '#f0a070', marginBottom: '0.5rem' }}>{s}</h3>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button style={{ ...darkBtn, background: '#c04a1a', color: 'white', padding: '1rem 2.5rem' }} onClick={openStaging}>
            Request a Quote
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a3a5c', padding: '3rem 3rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#f8f4ee', letterSpacing: '0.15em' }}>
              CHIC <span style={{ color: '#f0a070' }}>FURNISH</span>
            </span>
            <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', color: 'rgba(214,232,245,0.65)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
              Buy Furniture
            </button>
            <button onClick={() => navigate('/inspiration')} style={{ background: 'none', border: 'none', color: '#f0a070', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Staging
            </button>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'rgba(214,232,245,0.45)' }}>© 2026 Chic Furnish · Auckland, New Zealand</span>
        </div>
      </footer>

      {/* ── ROOM IDEA DETAIL MODAL ── */}
      {detailCard && (() => {
        const allPhotos = [detailCard.photo_url, ...(detailCard.photos || [])].filter(Boolean);
        const featuredProducts = allListings.filter((l) => (detailCard.listing_ids || []).includes(l.id));
        return (
          <div className="modal-overlay" onClick={() => setDetailCard(null)} style={{ alignItems: 'flex-start', padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ background: '#f8f4ee', width: '100%', maxWidth: 900, border: '2px solid #b8c8d8', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>

              {/* Header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: '#1a3a5c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#d6e8f5', letterSpacing: '0.15em' }}>CHIC <span style={{ color: '#f0a070' }}>FURNISH</span></span>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f0a070', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'rgba(240,160,112,0.15)' }}>{detailCard.tag}</span>
                </div>
                <button onClick={() => setDetailCard(null)} style={{ background: 'none', border: '1.5px solid rgba(214,232,245,0.35)', color: '#d6e8f5', padding: '0.4rem 0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em' }}>✕ CLOSE</button>
              </div>

              {/* Room photo + thumbnails */}
              <div style={{ padding: '1.5rem', borderBottom: '1.5px solid #b8c8d8' }}>
                <div style={{ aspectRatio: '16/7', background: TAG_GRADIENTS[detailCard.tag] || '#d6e8f5', overflow: 'hidden', position: 'relative' }}>
                  {detailPhoto
                    ? <img src={detailPhoto} alt={detailCard.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(26,58,92,0.3)', letterSpacing: '0.3em' }}>{detailCard.tag.toUpperCase()}</span>
                      </div>
                  }
                </div>
                {allPhotos.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {allPhotos.map((photo, idx) => (
                      <div key={idx} onClick={() => setDetailPhoto(photo)} style={{ width: 72, height: 52, cursor: 'pointer', overflow: 'hidden', flexShrink: 0, outline: detailPhoto === photo ? '2.5px solid #1a3a5c' : '2px solid #b8c8d8', outlineOffset: '1px', transition: 'outline 0.15s' }}>
                        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + description */}
              <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: featuredProducts.length > 0 ? '1.5px solid #b8c8d8' : 'none' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: '#0f1e2e', marginBottom: '0.5rem' }}>{detailCard.title}</h2>
                {detailCard.description && <p style={{ fontSize: '0.95rem', color: '#2a3d52', lineHeight: 1.9 }}>{detailCard.description}</p>}
              </div>

              {/* ── SHOP THIS LOOK ── */}
              {featuredProducts.length > 0 && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.1rem' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a3a5c', fontWeight: 700 }}>Shop this look</p>
                    <div style={{ flex: 1, height: '1px', background: '#b8c8d8' }} />
                    <span style={{ fontSize: '0.72rem', color: '#4a5e72', fontWeight: 600 }}>{featuredProducts.length} {featuredProducts.length === 1 ? 'piece' : 'pieces'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.85rem' }}>
                    {featuredProducts.map((product) => {
                      const inCart = cart.find((c) => c.id === product.id);
                      return (
                        <div key={product.id} style={{ background: 'white', border: '2px solid #b8c8d8', overflow: 'hidden' }}>
                          <div style={{ height: 130, background: '#d6e8f5', overflow: 'hidden' }}>
                            {product.photo_url
                              ? <img src={product.photo_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: '0.7rem', color: 'rgba(26,58,92,0.35)', letterSpacing: '0.15em', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>{product.category}</span>
                                </div>
                            }
                          </div>
                          <div style={{ padding: '0.75rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f1e2e', lineHeight: 1.3, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: '#c04a1a', marginBottom: '0.6rem' }}>${Number(product.price).toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#4a5e72', fontFamily: 'var(--font-body)', fontWeight: 700 }}>NZD</span></p>
                            <button
                              onClick={() => addToCart(product)}
                              style={{ width: '100%', padding: '0.5rem', background: inCart ? '#eef5fb' : '#1a3a5c', color: inCart ? '#1a3a5c' : '#f0d8c8', border: inCart ? '1.5px solid #b8c8d8' : 'none', fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                              {inCart ? '✓ In Cart' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {cart.length > 0 && (
                    <div style={{ marginTop: '1.25rem', background: '#1a3a5c', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(214,232,245,0.6)', fontWeight: 700, marginBottom: '0.2rem' }}>{cart.length} item{cart.length > 1 ? 's' : ''} selected</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#f0a070', fontWeight: 600 }}>
                          ${cart.reduce((s, c) => s + Number(c.price), 0).toLocaleString()} NZD
                        </p>
                      </div>
                      <button
                        onClick={() => { setDetailCard(null); navigate('/shop'); }}
                        style={{ background: '#c04a1a', color: 'white', border: 'none', padding: '0.8rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
                      >
                        View in Shop →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Book staging CTA */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1.5px solid #b8c8d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f5f8' }}>
                <p style={{ fontSize: '0.88rem', color: '#2a3d52', fontWeight: 500 }}>Love this look? We can stage your property just like this.</p>
                <button
                  onClick={() => { setDetailCard(null); openStaging(); }}
                  style={{ background: '#1a3a5c', color: '#f0d8c8', border: 'none', padding: '0.7rem 1.4rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1.5rem' }}
                >
                  Book a Staging →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── REQUIRE LOGIN MODAL ── */}
      {requireLogin && (
        <div className="modal-overlay" onClick={() => setRequireLogin(false)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ textAlign: 'center' }}>Sign in to continue</h2>
            <p style={{ color: '#4a5e72', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
              Please create an account or sign in to book a staging service.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button style={darkBtn} onClick={() => navigate('/login')}>Sign In</button>
              <button style={rustOutlineBtn} onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGING BOOKING MODAL ── */}
      {stagingModal && (
        <div className="modal-overlay" onClick={() => setStagingModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#c04a1a', marginBottom: '1rem' }}>✓</div>
                <h2 className="modal-title" style={{ textAlign: 'center' }}>Booking Received</h2>
                <p style={{ color: '#4a5e72', fontSize: '0.95rem', lineHeight: 1.9, fontWeight: 400 }}>
                  Thank you! Our team will be in touch within 24 hours with your personalised quote.
                </p>
              </div>
            ) : (
              <>
                <h2 className="modal-title">Book a Staging</h2>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021 XXX XXX" /></div>
                  <div className="form-group"><label className="form-label">Preferred Date</label><input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Property Address *</label><input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address, Auckland" /></div>
                <div className="form-group">
                  <label className="form-label">Service Required</label>
                  <select className="form-select" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Number of rooms, any special requirements..." /></div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'none', border: '2px solid #b8c8d8', color: '#4a5e72', padding: '0.7rem 1.3rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }} onClick={() => setStagingModal(false)}>Cancel</button>
                  <button style={darkBtn} onClick={handleSubmit}>Submit Booking →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

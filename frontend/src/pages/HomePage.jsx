import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Explore Past Recalls',
    description: 'Search historical FDA food recalls from 2012-2019 by date range and classification.',
    path: '/past_recalls',
    color: '#22D3EE',
  },
  {
    title: 'Explore Recent Recalls',
    description: 'View the most recent 100 FDA food recalls with real-time data from the FDA API.',
    path: '/current_recalls',
    color: '#60A5FA',
  },
  {
    title: 'Recalls by State Over Time',
    description: 'Analyze food recall trends by state from 2012 to 2019 with interactive line charts.',
    path: '/recalls_by_state',
    color: '#818CF8',
  },
  {
    title: 'CPSC Product Recalls',
    description: 'Explore consumer product recalls from the CPSC with category and date filters.',
    path: '/cpsc_recalls',
    color: '#A78BFA',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Project Overview */}
      <div className="bg-[#1E293B] rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">FDA Food Recalls: Project Overview</h1>
        <hr className="border-[#334155] mb-4" />
        <p className="text-[#CBD5E1] mb-3 leading-relaxed">
          The purpose of this project is to provide a full-stack application for exploring
          food recall data made available by the US Food &amp; Drug Administration via the{' '}
          <a href="https://open.fda.gov/" className="text-[#22D3EE] hover:underline" target="_blank" rel="noreferrer">
            OpenFDA
          </a>{' '}
          portal, as well as consumer product recall data from the CPSC.
        </p>
        <p className="text-[#CBD5E1] leading-relaxed">
          Data was gathered, cleaned, and stored in a SQLite database with over 4,000 records
          of food recalls between 2012 and 2019. The frontend is built with React, Tailwind CSS,
          Plotly, and Leaflet. The Flask backend serves JSON data and proxies external APIs.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="bg-[#1E293B] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Visualizations</h2>
        <hr className="border-[#334155] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="group block no-underline"
            >
              <div
                className="bg-[#0F172A] rounded-xl p-5 border border-[#334155] transition-all duration-300 hover:border-opacity-60 hover:shadow-lg hover:shadow-black/20 h-full"
                style={{ borderColor: card.color + '40' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.color + '20' }}
                >
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: card.color }} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2 group-hover:text-[#22D3EE] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

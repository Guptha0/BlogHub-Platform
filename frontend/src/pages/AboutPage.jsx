import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFeather,
  FiShield,
  FiZap,
  FiCode,
  FiDatabase,
  FiLayers,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';

const techStack = [
  {
    name: 'React 19 & Vite',
    role: 'Frontend Core',
    desc: 'High-speed component architecture, responsive single-page routing, and rapid HMR development.',
    icon: FiCode,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Node.js & Express',
    role: 'Backend API',
    desc: 'Scalable RESTful microservices, centralized error interceptors, and strict JWT authentication.',
    icon: FiLayers,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'MongoDB & Mongoose',
    role: 'Database & ODM',
    desc: 'Rich relational references, virtual count fields, full-text search indexing, and resilient data models.',
    icon: FiDatabase,
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Tailwind CSS',
    role: 'Design System',
    desc: 'Tailored dark navy and purple aesthetic, smooth transitions, and responsive typography.',
    icon: FiZap,
    color: 'from-purple-500 to-brand-600',
  },
];

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-navy-800 dark:text-brand-300 border border-brand-200 dark:border-navy-700">
          Our Vision & Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About Blog<span className="text-brand-600 dark:text-brand-400">Hub</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          BlogHub was built from the ground up to empower developers, designers, and domain experts to publish thoughtful articles in an environment that prizes clarity, speed, and genuine community engagement.
        </p>
      </section>

      {/* Philosophy Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-navy-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <FiFeather className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Creator First
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            A distraction-free writing environment with real-time markdown previews, draft staging, and post-level metrics.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FiShield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Author Moderation
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Writers maintain full ownership of their discussions. Moderate spam or unwanted replies without administrative friction.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiZap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Modern Performance
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Zero bloat, sub-100ms API response times, secure JWT session cookies, and an elegant dark navy aesthetic.
          </p>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built on a Modern Full-Stack
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered with industry-standard patterns and modern web primitives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft flex items-start space-x-4"
              >
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-tr ${tech.color} text-white flex-shrink-0 shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {tech.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                      {tech.role}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 text-white text-center shadow-xl shadow-brand-500/10 space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to share your voice with the world?
        </h2>
        <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
          Join thousands of engineers and thinkers writing on BlogHub today.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-slate-50 transition"
          >
            <span>Create Your Account</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition"
          >
            <span>Explore Articles</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;


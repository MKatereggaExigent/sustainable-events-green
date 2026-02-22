import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Search, Download, ExternalLink, X } from 'lucide-react';
import { defaultResources, Resource } from '@/lib/carbonData';

const ResourceLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(defaultResources.map(r => r.category))];

  const filtered = defaultResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Resource Library
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expert guides, certification pathways, and best practices for sustainable event planning.
          </p>
        </div>

        {/* Search and filters - Responsive */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((resource) => (
            <div
              key={resource.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedResource(resource)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                    {resource.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {resource.readTime}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium group-hover:gap-2 transition-all">
                    Read more
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No resources found matching your search.</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-3">Stay Updated</h3>
              <p className="text-indigo-200">
                Get the latest sustainability guides, industry reports, and EventCarbon updates delivered to your inbox.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.querySelector('input') as HTMLInputElement;
                if (input.value) {
                  alert(`Thanks for subscribing with ${input.value}! You'll receive our next newsletter.`);
                  input.value = '';
                }
              }}
              className="flex gap-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Resource detail modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedResource(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48">
              <img src={selectedResource.image} alt={selectedResource.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                  {selectedResource.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedResource.readTime}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedResource.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{selectedResource.description}</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                This comprehensive resource covers everything you need to know about implementing sustainable practices 
                in your event planning workflow. From practical checklists to vendor recommendations, you'll find 
                actionable strategies that can be implemented immediately.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    alert(`Downloading "${selectedResource.title}"...`);
                    setSelectedResource(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Online
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResourceLibrary;

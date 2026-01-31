import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Clock,
  Shield,
  Pill,
  Store,
  ArrowRight,
  CheckCircle2,
  Zap,
  Heart,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const { user, profile } = useAuthStore();

  const features = [
    {
      icon: Search,
      title: 'Quick Search',
      description: 'Find medicines instantly with our smart search system',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MapPin,
      title: 'Location Based',
      description: 'Discover nearest pharmacies with available stock',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get live inventory updates from pharmacies',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: 'Verified Stores',
      description: 'All registered pharmacies are verified and trusted',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Medicines Listed' },
    { value: '500+', label: 'Partner Pharmacies' },
    { value: '50K+', label: 'Users Helped' },
    { value: '24/7', label: 'Availability' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-white/70">Emergency Medicine Locator</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Find{' '}
                <span className="gradient-text">Life-Saving</span>
                <br />
                Medicines Nearby
              </h1>

              <p className="text-lg text-white/70 mb-8 max-w-lg">
                In medical emergencies, every second counts. Quickly locate medicines
                at nearby pharmacies and get directions to save precious time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/search">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-button flex items-center gap-2 w-full sm:w-auto justify-center emergency-pulse"
                  >
                    <Search size={20} />
                    <span>Find Medicine Now</span>
                  </motion.button>
                </Link>

                {!user && (
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-button-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Store size={20} />
                      <span>Register Your Pharmacy</span>
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/50">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="glass-card p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                      <Pill size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Emergency Search</h3>
                      <p className="text-white/50">Find medicines in seconds</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-input flex items-center gap-3">
                      <Search size={20} className="text-white/50" />
                      <span className="text-white/50">Search for medicine...</span>
                    </div>

                    <div className="flex items-center gap-2 text-green-400">
                      <MapPin size={16} />
                      <span className="text-sm">3 stores found within 2km</span>
                    </div>

                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-600/20 flex items-center justify-center">
                              <Store size={20} className="text-primary-400" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">Pharmacy {i}</div>
                              <div className="text-xs text-white/50">
                                {0.5 * i} km away
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 size={20} className="text-green-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl glass flex items-center justify-center"
                >
                  <Zap size={40} className="text-yellow-500" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 rounded-2xl glass flex items-center justify-center z-0 opacity-80 hidden lg:flex"
                >
                  <Heart size={24} className="text-red-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">MediFind</span>?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We're dedicated to making medicine search fast, reliable, and accessible
              for everyone during emergencies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Finding medicines has never been easier. Follow these simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search Medicine',
                description: 'Enter the medicine name you need to find',
                icon: Search,
              },
              {
                step: '02',
                title: 'View Nearby Stores',
                description: 'See all pharmacies with available stock on the map',
                icon: MapPin,
              },
              {
                step: '03',
                title: 'Get Directions',
                description: 'Navigate to the nearest pharmacy and get your medicine',
                icon: ArrowRight,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="glass-card p-8 h-full">
                  <div className="text-5xl font-bold gradient-text opacity-50 mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-4">
                    <item.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight size={24} className="text-white/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-600/20" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Save Lives?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Join our network of pharmacies and help people find life-saving
                medicines during emergencies. Or start searching for medicines now.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/search">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-button flex items-center gap-2 justify-center"
                  >
                    <Search size={20} />
                    <span>Search Medicine</span>
                  </motion.button>
                </Link>

                {!user && (
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass-button-secondary flex items-center gap-2 justify-center"
                    >
                      <Store size={20} />
                      <span>Register Pharmacy</span>
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="font-semibold gradient-text">MediFind</span>
          </div>

          <p className="text-white/50 text-sm text-center">
            © 2026 MediFind. Saving lives, one search at a time.
          </p>

          <div className="flex items-center gap-4 text-white/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

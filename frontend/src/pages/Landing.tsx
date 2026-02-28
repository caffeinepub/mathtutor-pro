import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getStore } from '../lib/store';
import { BookOpen, Users, Star, Phone, Mail, MapPin, Menu, X, ChevronRight, Award, Clock, TrendingUp } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

const WHATSAPP_NUMBER = '919424135055';

function getWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    course: 'JEE Mathematics',
    rating: 5,
    text: 'Rajat sir\'s teaching style is exceptional. I improved my JEE score significantly!',
  },
  {
    name: 'Arjun Patel',
    course: 'Board Exam Prep',
    rating: 5,
    text: 'The personalized attention in 1-on-1 sessions helped me score 95% in boards.',
  },
  {
    name: 'Sneha Gupta',
    course: 'NEET Mathematics',
    rating: 5,
    text: 'Concepts are explained so clearly. Highly recommend for NEET aspirants!',
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let courses: ReturnType<typeof getStore>['courses'] = [];
  try {
    courses = getStore().courses.filter((c) => c.active);
  } catch {
    courses = [];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="w-8 h-8 rounded" />
            <span className="font-bold text-foreground">Rajat's Equation</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#courses" className="text-muted-foreground hover:text-foreground transition-colors">Courses</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Register
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
            <a href="#courses" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Courses</a>
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm border border-border rounded-lg py-2 text-foreground hover:bg-muted transition-colors">Login</Link>
              <Link to="/register" className="flex-1 text-center text-sm bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm">
              <Award size={14} className="text-gold" />
              <span>Expert Mathematics Tutoring</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Master Mathematics with{' '}
              <span className="text-gold">Rajat's Equation</span>
            </h1>
            <p className="text-white/80 text-lg">
              Personalized tutoring for JEE, NEET, Board Exams & Foundation courses.
              Learn from an expert with proven results.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-gold text-navy font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
              >
                Get Started
                <ChevronRight size={18} />
              </Link>
              <a
                href={getWhatsAppLink("Hi! I'd like to know more about your mathematics tutoring courses.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <SiWhatsapp size={18} />
                WhatsApp Us
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/assets/generated/hero-illustration.dim_1200x480.png"
              alt="Mathematics tutoring"
              className="w-full rounded-2xl opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Students Taught', value: '500+', icon: Users },
            { label: 'Success Rate', value: '95%', icon: TrendingUp },
            { label: 'Years Experience', value: '8+', icon: Award },
            { label: 'Courses Available', value: `${courses.length}`, icon: BookOpen },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-1">
                <Icon size={24} className="text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Our Courses</h2>
            <p className="text-muted-foreground mt-2">Choose the right course for your goals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-2">{course.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                  <div className="text-2xl font-bold text-primary">₹{course.pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hr</span></div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>Flexible hours</span>
                  </div>
                  <a
                    href={getWhatsAppLink(`Hi! I'm interested in the ${course.name} course. Can you share more details?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors mt-2"
                  >
                    <SiWhatsapp size={16} />
                    Enquire on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us?</h2>
            <p className="text-muted-foreground mt-2">What makes Rajat's Equation different</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Personalized Learning',
                desc: 'Both group and 1-on-1 sessions tailored to your learning pace and style.',
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                desc: '95% of students see significant improvement in their exam scores.',
              },
              {
                icon: Clock,
                title: 'Flexible Scheduling',
                desc: 'Book sessions at your convenience with flexible timing options.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Student Reviews</h2>
            <p className="text-muted-foreground mt-2">What our students say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Excel in Mathematics?</h2>
          <p className="text-white/80">
            Join hundreds of students who have improved their scores with Rajat's Equation.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="bg-gold text-navy font-semibold px-8 py-3 rounded-lg hover:bg-gold/90 transition-colors"
            >
              Enroll Now
            </Link>
            <a
              href={getWhatsAppLink("Hi! I'd like to enroll in your mathematics tutoring program.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg transition-colors"
            >
              <SiWhatsapp size={18} />
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Contact Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Phone size={20} className="text-primary" />
              </div>
              <p className="font-medium text-foreground">Phone / WhatsApp</p>
              <p className="text-sm text-muted-foreground">+91 94241 35055</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail size={20} className="text-primary" />
              </div>
              <p className="font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">rajat@rajatsequation.com</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin size={20} className="text-primary" />
              </div>
              <p className="font-medium text-foreground">Location</p>
              <p className="text-sm text-muted-foreground">Online & In-person sessions available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo-mark.dim_128x128.png" alt="Logo" className="w-6 h-6 rounded" />
            <span className="font-bold">Rajat's Equation</span>
          </div>
          <p className="text-white/60">
            © {new Date().getFullYear()} Rajat's Equation. All rights reserved.
          </p>
          <p className="text-white/60">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

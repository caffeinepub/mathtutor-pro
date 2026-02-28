import { Link } from '@tanstack/react-router';
import { BookOpen, Users, Award, Clock, Star, CheckCircle, ArrowRight, Heart } from 'lucide-react';
import { getStore } from '../lib/store';

const WHATSAPP_NUMBER = '919424135055';

function getWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function Landing() {
  let courses: ReturnType<typeof getStore>['courses'] = [];
  try {
    const store = getStore();
    courses = store.courses.filter((c) => c.active);
  } catch {
    courses = [];
  }

  const stats = [
    { label: 'Students Taught', value: '500+' },
    { label: 'Success Rate', value: '95%' },
    { label: 'Years Experience', value: '8+' },
    { label: 'Courses Offered', value: `${courses.length}+` },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Personalized Learning',
      description: "Customized study plans tailored to each student's strengths and weaknesses.",
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Learn from an experienced educator with a proven track record of student success.',
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Our students consistently achieve top scores in JEE, NEET, and board exams.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Choose session timings that fit your schedule with online Google Meet sessions.',
    },
  ];

  const testimonials = [
    {
      name: 'Arjun Sharma',
      score: 'JEE Advanced AIR 342',
      text: "Rajat sir's teaching methodology is exceptional. His problem-solving approach helped me crack JEE Advanced.",
      rating: 5,
    },
    {
      name: 'Priya Patel',
      score: 'NEET Score: 680/720',
      text: 'The personalized attention and regular practice sessions made all the difference in my NEET preparation.',
      rating: 5,
    },
    {
      name: 'Rohit Kumar',
      score: 'Class 12: 98% in Maths',
      text: 'I went from struggling with calculus to scoring 98% in boards. Thank you Rajat sir!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/rajats-equation-logo.dim_400x300.png"
                alt="Rajat's Equation"
                className="h-10 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-bold text-lg text-primary hidden sm:block">The Rajat's Equation</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-current" />
                Trusted by 500+ Students
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Master Mathematics with{' '}
                <span className="text-primary">Expert Guidance</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Personalized online math tutoring for JEE, NEET, and board exam aspirants.
                Learn from Rajat sir with proven teaching methods and achieve your dream scores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={getWhatsAppLink('Hi! I want to book a free demo class for math tutoring.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Book Free Demo
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/assets/generated/hero-illustration.dim_1200x480.png"
                alt="Math tutoring illustration"
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Courses</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive courses designed to help you excel in competitive exams and board examinations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-card-foreground mb-2">{course.name || course.title}</h3>
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {course.level}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">₹{course.price}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <a
                  href={getWhatsAppLink(`Hi! I'm interested in the ${course.name || course.title} course. Can you share more details?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Book Demo on WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide a comprehensive learning experience that goes beyond just teaching formulas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Student Success Stories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from students who transformed their math skills and achieved their goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-card-foreground">{testimonial.name}</div>
                  <div className="text-primary text-sm font-medium">{testimonial.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Excel in Mathematics?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of successful students. Book your free demo class today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppLink('Hi! I want to book a free demo class for math tutoring.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Book Free Demo
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/generated/rajats-equation-logo.dim_400x300.png"
                  alt="Rajat's Equation"
                  className="h-10 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Expert mathematics tutoring for JEE, NEET, and board exam aspirants.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
                <li>
                  <a
                    href={getWhatsAppLink('Hi! I want to know more about your math courses.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>WhatsApp: +91 94241 35055</li>
                <li>Online Sessions via Google Meet</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>© {new Date().getFullYear()} The Rajat's Equation. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Built with <Heart className="w-4 h-4 fill-primary text-primary mx-1" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'rajats-equation')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

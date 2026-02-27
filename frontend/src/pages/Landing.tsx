import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Calculator,
  Users,
  Star,
  CheckCircle,
  Menu,
  X,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

const courses = [
  {
    id: 1,
    title: 'JEE Mathematics',
    description:
      'Comprehensive preparation for JEE Main & Advanced covering all topics from algebra to calculus with problem-solving techniques.',
    level: 'Advanced',
    duration: '12 months',
    price: '₹15,000',
    topics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry'],
    rating: 4.9,
    students: 320,
  },
  {
    id: 2,
    title: 'NEET Mathematics',
    description:
      'Focused mathematics preparation for NEET aspirants covering all relevant topics with biology-context problems.',
    level: 'Intermediate',
    duration: '10 months',
    price: '₹12,000',
    topics: ['Statistics', 'Algebra', 'Trigonometry', 'Calculus'],
    rating: 4.8,
    students: 280,
  },
  {
    id: 3,
    title: 'Class 11-12 Mathematics',
    description:
      'Complete CBSE/ICSE board preparation with in-depth coverage of all chapters and exam-oriented practice.',
    level: 'Intermediate',
    duration: '8 months',
    price: '₹10,000',
    topics: ['Sets & Functions', 'Algebra', 'Calculus', 'Probability'],
    rating: 4.9,
    students: 450,
  },
  {
    id: 4,
    title: 'Foundation Mathematics',
    description:
      'Strong foundation building for Class 8-10 students with conceptual clarity and competitive exam readiness.',
    level: 'Beginner',
    duration: '6 months',
    price: '₹8,000',
    topics: ['Number Theory', 'Geometry', 'Algebra', 'Mensuration'],
    rating: 4.7,
    students: 380,
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    score: 'JEE Advanced AIR 245',
    text: "Rajat sir's teaching methodology is exceptional. His way of breaking down complex problems made JEE preparation much easier.",
    avatar: 'PS',
  },
  {
    name: 'Arjun Patel',
    score: '99.2 percentile in JEE Main',
    text: 'The structured approach and regular practice sessions helped me achieve my dream score. Highly recommended!',
    avatar: 'AP',
  },
  {
    name: 'Sneha Gupta',
    score: 'Class 12 - 98/100 in Maths',
    text: 'I was struggling with calculus but after joining The Rajat\'s Equation, I scored full marks. Amazing teaching!',
    avatar: 'SG',
  },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/assets/generated/rajats-equation-logo.dim_400x300.png"
                alt="The Rajat's Equation"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Courses
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border space-y-3">
              <a href="#courses" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1">Courses</a>
              <a href="#testimonials" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1">Testimonials</a>
              <a href="#about" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1">About</a>
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
                🏆 Trusted by 1400+ Students
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Master Mathematics with{' '}
                <span className="text-primary">The Rajat's Equation</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Expert-led mathematics coaching for JEE, NEET, and Board exams. 
                Personalized attention, proven methodology, and outstanding results.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="px-8">
                    Start Learning Today
                  </Button>
                </Link>
                <WhatsAppButton
                  label="Book Free Demo"
                  message="Hi, I want to book a free demo session for mathematics coaching."
                  className="text-sm px-6 py-2.5"
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">1400+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">10+ Years Exp.</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <img
                src="/assets/generated/hero-illustration.dim_1200x480.png"
                alt="Mathematics Learning"
                className="w-full max-w-lg rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1400+', label: 'Students Enrolled' },
              { value: '98%', label: 'Success Rate' },
              { value: '10+', label: 'Years Experience' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Our Courses</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Carefully designed courses to help you excel in competitive exams and board examinations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow border-border group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calculator className="w-4 h-4 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-primary">{course.price}</div>
                      <div className="text-xs text-muted-foreground">{course.duration}</div>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.students} students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Link to="/register" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Enroll Now
                      </Button>
                    </Link>
                    <WhatsAppButton
                      label="Book Demo"
                      message={`Hi, I want to book a demo session for the ${course.title} course.`}
                      className="flex-1 justify-center text-sm py-1.5 px-3"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Rajat's Equation Advantage
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-primary" />,
                title: 'Structured Curriculum',
                desc: 'Carefully designed syllabus covering every topic with progressive difficulty levels.',
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-primary" />,
                title: 'Proven Results',
                desc: 'Consistent track record of students achieving top ranks in JEE, NEET, and board exams.',
              },
              {
                icon: <Users className="w-6 h-6 text-primary" />,
                title: 'Personal Attention',
                desc: 'Small batch sizes ensure every student gets individual attention and doubt resolution.',
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-primary" />,
                title: 'Regular Assessments',
                desc: 'Weekly tests and mock exams to track progress and identify areas for improvement.',
              },
              {
                icon: <Award className="w-6 h-6 text-primary" />,
                title: 'Expert Faculty',
                desc: 'Learn from experienced educators with deep subject expertise and teaching excellence.',
              },
              {
                icon: <Clock className="w-6 h-6 text-primary" />,
                title: 'Flexible Scheduling',
                desc: 'Choose session timings that fit your schedule with online and offline options.',
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 p-6 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Student Success</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Students Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-primary font-medium">{t.score}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Crack Your Exam?
          </h2>
          <p className="text-lg opacity-90">
            Join 1400+ students who have achieved their dreams with The Rajat's Equation.
            Book a free demo session today!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Register Now
              </Button>
            </Link>
            <WhatsAppButton
              label="Book Free Demo"
              message="Hi, I want to book a free demo session for mathematics coaching."
              className="text-base px-8 py-2.5"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <img
                src="/assets/generated/rajats-equation-logo.dim_400x300.png"
                alt="The Rajat's Equation"
                className="h-14 w-auto object-contain mb-3"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Expert mathematics coaching for competitive exams and board examinations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#courses" className="hover:text-foreground transition-colors">Courses</a></li>
                <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Student Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📱 +91 94241 35055</p>
                <p>📧 rajatsequation@gmail.com</p>
                <div className="pt-2">
                  <WhatsAppButton
                    label="Chat on WhatsApp"
                    message="Hi, I have a query about The Rajat's Equation courses."
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} The Rajat's Equation. All rights reserved.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'rajats-equation')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCourses, Course } from '../lib/store';
import { BookOpen, Users, User, ArrowRight, MessageCircle, GraduationCap, CheckCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919424135055';

function openWhatsApp(message: string) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

export default function Landing() {
  const courses = getCourses().filter((c) => c.isActive);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-sky-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/rajats-equation-logo.dim_400x300.png"
              alt="Rajat's Equation"
              className="h-12 object-contain"
            />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-slate-600 font-medium">
            <a href="#courses" className="hover:text-sky-600 transition-colors">Courses</a>
            <a href="#about" className="hover:text-sky-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-sky-600 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50 h-10 px-5">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white h-10 px-5">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 to-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <Badge className="bg-sky-100 text-sky-700 border-sky-200 mb-4 text-sm px-3 py-1">
              Online Math Tutoring
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Learn Math with{' '}
              <span className="text-sky-600">Rajat Sir</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-xl">
              Expert math coaching for JEE, Board Exams, Olympiad, and Foundation courses.
              Learn at your own pace with personalized attention.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/register">
                <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white h-13 px-8 text-base font-semibold w-full sm:w-auto">
                  Start Learning Today
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openWhatsApp('Hi! I want to know more about your math courses.')}
                className="border-green-400 text-green-700 hover:bg-green-50 h-13 px-8 text-base font-semibold w-full sm:w-auto"
              >
                <MessageCircle size={18} className="mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/assets/generated/hero-illustration.dim_1200x480.png"
              alt="Math Learning"
              className="w-full max-w-lg rounded-2xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Courses</h2>
            <p className="text-slate-500 text-lg">Choose the right course for your goals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-sky-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <GraduationCap size={48} className="mx-auto text-sky-600 mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">About Rajat Sir</h2>
          <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            Passionate about making mathematics accessible and enjoyable for every student.
            Specializing in JEE preparation, Board exams, and Olympiad training with a focus
            on building strong conceptual foundations.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { icon: <BookOpen size={28} />, title: 'Concept-First Approach', desc: 'Deep understanding over rote learning' },
              { icon: <Users size={28} />, title: 'Small Batch Sizes', desc: 'Personal attention in every session' },
              { icon: <CheckCircle size={28} />, title: 'Flexible Scheduling', desc: 'Learn at your convenient time' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-sky-100">
                <div className="text-sky-600 mb-3 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', text: 'Rajat Sir explains concepts so clearly. My JEE preparation improved a lot!', course: 'JEE Mains' },
              { name: 'Arjun M.', text: 'The one-on-one sessions are amazing. I can ask any doubt without hesitation.', course: 'JEE Advanced' },
              { name: 'Sneha K.', text: 'Board exam preparation was very structured. Got 95% in Math!', course: 'Board Exams' },
            ].map((t, i) => (
              <div key={i} className="bg-sky-50 rounded-xl p-5 border border-sky-100">
                <p className="text-slate-700 mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-slate-800">{t.name}</p>
                  <p className="text-sm text-sky-600">{t.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 bg-sky-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-sky-100 text-lg mb-8">
            Register today and take the first step towards mastering mathematics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-sky-700 hover:bg-sky-50 h-13 px-8 text-base font-semibold w-full sm:w-auto">
                Register Now
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openWhatsApp('Hi! I want to enroll in your math course.')}
              className="border-white text-white hover:bg-sky-700 h-13 px-8 text-base font-semibold w-full sm:w-auto"
            >
              <MessageCircle size={18} className="mr-2" />
              WhatsApp Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <img
            src="/assets/generated/rajats-equation-logo.dim_400x300.png"
            alt="Rajat's Equation"
            className="h-10 mx-auto mb-4 object-contain opacity-70"
          />
          <p className="text-sm mb-2">© {new Date().getFullYear()} Rajat's Equation. All rights reserved.</p>
          <p className="text-xs text-slate-500">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'rajats-equation')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-lg leading-tight">{course.name}</h3>
        <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50 text-xs ml-2 flex-shrink-0">
          {course.level}
        </Badge>
      </div>
      <p className="text-slate-500 text-sm mb-4 flex-1">{course.description}</p>

      {/* Pricing */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2">
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <Users size={14} className="text-sky-500" />
            Group Class
          </span>
          <span className="font-bold text-sky-700">₹{course.groupPricePerHour}/hr</span>
        </div>
        <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <User size={14} className="text-purple-500" />
            One-on-One
          </span>
          <span className="font-bold text-purple-700">₹{course.oneOnOnePricePerHour}/hr</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-green-400 text-green-700 hover:bg-green-50 font-semibold"
        onClick={() => window.open(`https://wa.me/919424135055?text=${encodeURIComponent(`Hi! I'm interested in the ${course.name} course. Please share more details.`)}`, '_blank')}
      >
        <MessageCircle size={15} className="mr-2" />
        Enquire on WhatsApp
      </Button>
    </div>
  );
}

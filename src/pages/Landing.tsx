import { ArrowRight, Calendar, CheckCircle, Clock, MapPin, Search, Shield, Star, Stethoscope, Users, Zap } from 'lucide-react';
import Footer from '../components/Footer';

interface LandingProps {
  navigate: (path: string) => void;
}

const specializations = [
  { name: 'General', icon: '🏥', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  { name: 'Dental', icon: '🦷', color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' },
  { name: 'Dermatology', icon: '✨', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
  { name: 'ENT', icon: '👂', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
  { name: 'Pediatrics', icon: '👶', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
  { name: 'Cardiology', icon: '❤️', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  { name: 'Orthopedics', icon: '🦴', color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' },
  { name: 'Ophthalmology', icon: '👁️', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
];

const steps = [
  { step: '01', icon: Search, title: 'Find a Clinic', desc: 'Search by specialization or location to discover top-rated clinics near you.' },
  { step: '02', icon: Calendar, title: 'Book a Slot', desc: 'Choose your preferred date. We automatically assign the best available time slot.' },
  { step: '03', icon: CheckCircle, title: 'Get Confirmed', desc: 'Receive an instant token number, confirmation, and estimated waiting time.' },
];

const testimonials = [
  { name: 'Priya M.', role: 'Patient', rating: 5, text: 'Booking my dental appointment was a breeze. I got an instant confirmation and the token system meant zero waiting room stress!', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Rajan K.', role: 'Patient', rating: 5, text: 'Found a great dermatologist nearby within minutes. The clinic details and ratings helped me make a confident choice.', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' },
  { name: 'Dr. Anita S.', role: 'Doctor', rating: 5, text: 'Managing my clinic appointments is now effortless. The patient dashboard gives me everything I need at a glance.', avatar: 'https://images.pexels.com/photos/5329716/pexels-photo-5329716.jpeg?auto=compress&cs=tinysrgb&w=100' },
];

export default function Landing({ navigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm px-4 py-2 rounded-full mb-6 font-medium">
                <Zap className="w-4 h-4" />
                Instant Appointment Booking
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Your Health,<br />
                <span className="text-blue-200">One Click Away</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Connect with verified local clinics, book appointments in seconds, and track your healthcare journey — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/register-doctor')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Stethoscope className="w-4 h-4" /> Join as Doctor
                </button>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-white">2,400+</p>
                  <p className="text-blue-200 text-sm">Appointments booked</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-white">150+</p>
                  <p className="text-blue-200 text-sm">Verified clinics</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-white">4.9★</p>
                  <p className="text-blue-200 text-sm">Average rating</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Healthcare professional"
                  className="rounded-2xl shadow-2xl w-full object-cover h-96"
                />
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Appointment Confirmed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Token #7 · Dr. Sarah Mitchell</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">~15 min wait</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse by Specialization</h2>
            <p className="text-gray-500 dark:text-gray-400">Find the right specialist for your needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {specializations.map(spec => (
              <button
                key={spec.name}
                onClick={() => navigate('/patient/clinics')}
                className={`${spec.color} flex flex-col items-center gap-2 p-4 rounded-2xl font-medium text-sm hover:scale-105 transition-transform`}
              >
                <span className="text-2xl">{spec.icon}</span>
                <span>{spec.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How ClinicConnect Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Three simple steps to get the care you need</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 z-0" />
                )}
                <div className="relative z-10 text-center p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <step.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-blue-400 mb-2">{step.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-blue-600 dark:bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Everything You Need for Modern Healthcare Management</h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'All doctors are license-verified before appearing in listings' },
                  { icon: Zap, text: 'Smart slot allocation prevents double booking automatically' },
                  { icon: Clock, text: 'Real-time queue tracking and estimated wait times' },
                  { icon: MapPin, text: 'Location-based clinic discovery with detailed profiles' },
                  { icon: Star, text: 'Verified patient reviews and ratings for every clinic' },
                  { icon: Users, text: 'Dedicated portals for patients, doctors, and administrators' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <f.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-blue-100 text-sm pt-1">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Clinic" className="rounded-2xl object-cover h-48 w-full" />
              <img src="https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Doctor" className="rounded-2xl object-cover h-48 w-full mt-6" />
              <img src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Patient" className="rounded-2xl object-cover h-48 w-full -mt-6" />
              <img src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Healthcare" className="rounded-2xl object-cover h-48 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Loved by Patients & Doctors</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
            Join thousands of patients and clinics already using ClinicConnect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg text-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
